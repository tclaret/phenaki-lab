export function detectCircle(img) {
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const src = cv.imread(canvas);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);

    const circles = new cv.Mat();
    cv.HoughCircles(
      src,
      circles,
      cv.HOUGH_GRADIENT,
      1,
      50,
      100,
      40,
      img.width * 0.3,
      img.width * 0.6
    );

    const [x, y, r] = circles.data32F;

    src.delete();
    circles.delete();

    return { x, y, r };
}

