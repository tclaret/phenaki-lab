import GIF from 'gif.js';
import gifWorkerUrl from 'gif.js/dist/gif.worker.js?url';

export async function exportGif(frames, fps = 24) {
  if (!frames || frames.length === 0) throw new Error('No frames to export');

  // gif.js with worker script URL
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: frames[0].width,
    height: frames[0].height,
    workerScript: gifWorkerUrl,
    repeat: 0,
    background: null,
    comment: 'Created with Phenakistoscope Lab - https://tclaret.github.io/phenaki-lab/'
  });

  // Add each frame with delay calculated from fps
  const delayMs = Math.round(1000 / fps);
  for (const frame of frames) {
    // Ensure the frame is drawn onto an opaque background to avoid GIF alpha/black issues
    const w = frame.width;
    const h = frame.height;
    const tmp = document.createElement('canvas');
    tmp.width = w;
    tmp.height = h;
    const tctx = tmp.getContext('2d');
    // white background (safer for GIF viewers)
    tctx.fillStyle = '#ffffff';
    tctx.fillRect(0, 0, w, h);
    tctx.drawImage(frame, 0, 0);
    gif.addFrame(tmp, { delay: delayMs, copy: true });
  }

  // Return a promise that resolves with a blob URL when rendering completes
  return new Promise((resolve, reject) => {
    gif.on('finished', function (blob) {
      const url = URL.createObjectURL(blob);
      resolve(url);
    });
    gif.on('error', reject);
    gif.render();
  });
}

