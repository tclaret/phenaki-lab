export async function countObjectsOnCircle(img, circle, opts = {}) {
  const { x, y, r } = circle || { x: img.width / 2, y: img.height / 2, r: Math.min(img.width, img.height) / 2 };
  const samples = opts.samples || 720; // number of angular samples
  const innerOffset = opts.innerOffset || -Math.max(2, Math.round(r * 0.06)); // inward pixel offset
  const outerOffset = opts.outerOffset || Math.max(2, Math.round(r * 0.06)); // outward pixel offset
  const thresholdFactor = opts.thresholdFactor || 0.6; // for peak detection

  // draw image to canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const w = canvas.width;
  const h = canvas.height;

  function getBrightnessAt(px, py) {
    const x0 = Math.round(px);
    const y0 = Math.round(py);
    if (x0 < 0 || x0 >= w || y0 < 0 || y0 >= h) return 0;
    const idx = (y0 * w + x0) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    // luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // sample along a narrow radial band around the circle and average brightness
  const samplesArr = new Array(samples);
  for (let i = 0; i < samples; i++) {
    const ang = (i / samples) * Math.PI * 2;
    // sample a few points across the radial thickness and average
    const points = [];
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      const frac = (s / (steps - 1));
      const rr = r + innerOffset + (outerOffset - innerOffset) * frac;
      const px = x + rr * Math.cos(ang);
      const py = y + rr * Math.sin(ang);
      points.push(getBrightnessAt(px, py));
    }
    const avg = points.reduce((a, b) => a + b, 0) / points.length;
    samplesArr[i] = avg;
  }

  // compute adaptive threshold
  const mean = samplesArr.reduce((a, b) => a + b, 0) / samplesArr.length;
  const std = Math.sqrt(samplesArr.reduce((a, b) => a + (b - mean) ** 2, 0) / samplesArr.length);
  const thresh = mean + std * thresholdFactor;

  // create boolean mask and count groups
  const mask = samplesArr.map(v => v > thresh);

  // group adjacent true values (wraparound)
  let count = 0;
  let inGroup = false;
  let groupLengths = [];
  let currentLen = 0;
  for (let i = 0; i < mask.length * 2; i++) {
    const idx = i % mask.length;
    const val = mask[idx];
    if (val) {
      currentLen++;
      inGroup = true;
    } else {
      if (inGroup) {
        groupLengths.push(currentLen);
        currentLen = 0;
      }
      inGroup = false;
    }
    // only iterate until we've closed the possible wrap group once
    if (i >= mask.length && !inGroup) break;
  }
  // if we ended while inGroup, push
  if (inGroup && currentLen > 0) groupLengths.push(currentLen);

  // filter tiny groups (noise)
  const minGroupSize = Math.max(2, Math.round(samples / 360 * (opts.minDegrees || 5)));
  const groups = groupLengths.filter(l => l >= minGroupSize);
  count = groups.length;

  // compute angular positions for groups (center of group)
  const positions = [];
  let idxCursor = 0;
  for (const len of groupLengths) {
    const start = idxCursor % samples;
    const end = (idxCursor + len - 1) % samples;
    const mid = (start + Math.floor(len / 2)) % samples;
    positions.push({ start, end, mid, angle: (mid / samples) * 2 * Math.PI });
    idxCursor += len + 1;
  }

  return {
    count,
    samples: samplesArr,
    mask,
    groups: groups,
    positions,
    canvas
  };
}
