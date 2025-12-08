export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (file instanceof File) {
      img.src = URL.createObjectURL(file);
    } else {
      img.src = file; // string URL
    }
  });
}

