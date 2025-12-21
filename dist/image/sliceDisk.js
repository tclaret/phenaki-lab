export function sliceDisk(canvas, count = 24, opts = {}) {
  // opts: { circle: {x,y,r}, outputSize, margin, zoom, fps, rotationSpeed (deg/sec), direction, initialRotation (radians) }
  const frames = [];
  const { width: srcW, height: srcH } = canvas;

  const circle = opts.circle || { x: srcW / 2, y: srcH / 2, r: Math.min(srcW, srcH) / 2 };

  // Apply margin to radius to capture a larger area (entire disk, not just inner circle)
  const margin = opts.margin ?? 1.05;
  const captureRadius = Math.round(circle.r * margin); // Use margin to expand capture area

  // diameter in source pixels - using expanded radius to capture full disk
  const diameterSrc = captureRadius * 2;
  const outputSize = opts.outputSize || Math.max(32, Math.round(diameterSrc));

  const fps = opts.fps || 24;
  const rotationSpeed = typeof opts.rotationSpeed === 'number' ? opts.rotationSpeed : 0; // deg/sec
  const direction = opts.direction == null ? 1 : opts.direction; // 1 or -1
  const initialRotation = opts.initialRotation || 0; // radians

  // Create a cropped circular image (with transparent outside)
  const crop = document.createElement('canvas');
  crop.width = diameterSrc;
  crop.height = diameterSrc;
  const cctx = crop.getContext('2d');

  // draw the square region containing the circle
  // Use original circle center but expanded radius to capture full disk
  const sx = Math.round(circle.x - captureRadius);
  const sy = Math.round(circle.y - captureRadius);
  try {
    cctx.drawImage(canvas, sx, sy, diameterSrc, diameterSrc, 0, 0, diameterSrc, diameterSrc);
  } catch (e) {
    // fallback: draw entire canvas and hope for the best
    cctx.drawImage(canvas, 0, 0);
  }

  // Don't mask to a circle - we want to see the entire disk including the outer edges
  // For phenakistoscopes, the full disk (including black bars) should be visible
  // If masking is needed, it should use the full capture radius, not a smaller circle
  
  // Optional: mask only if explicitly requested, otherwise keep the full square capture
  // cctx.globalCompositeOperation = 'destination-in';
  // cctx.beginPath();
  // cctx.arc(diameterSrc / 2, diameterSrc / 2, diameterSrc / 2, 0, Math.PI * 2);
  // cctx.fillStyle = 'black';
  // cctx.fill();
  // cctx.globalCompositeOperation = 'source-over';

  // optionally scale crop to output size if different
  const scale = outputSize / diameterSrc;

  // compute angle per frame based on rotationSpeed (deg/sec) and fps
  const deltaDeg = rotationSpeed / fps; // degrees per frame
  const deltaRad = (deltaDeg * Math.PI) / 180 * direction;

  const cropDrawSize = Math.round(diameterSrc * (opts.zoom || 1));

  for (let i = 0; i < count; i++) {
    const angle = i * deltaRad + initialRotation; // Apply initial rotation offset

    const off = document.createElement('canvas');
    off.width = outputSize;
    off.height = outputSize;
    const octx = off.getContext('2d');

    // center
    octx.translate(outputSize / 2, outputSize / 2);
    octx.rotate(angle);

    // draw the crop centered
    // if scaling needed, draw at scaled size
    const drawW = Math.round(diameterSrc * (opts.zoom || 1));
    const drawH = drawW;
    octx.drawImage(crop, ( -drawW / 2 ), ( -drawH / 2 ), drawW, drawH);

    frames.push(off);
  }

  return frames;
}

