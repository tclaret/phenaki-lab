export function fixPerspective(img, circle) {
  const size = circle.r * 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    img,
    circle.x - circle.r,
    circle.y - circle.r,
    size,
    size,
    0,
    0,
    size,
    size
  );

  return canvas;
}

