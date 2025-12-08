import { writable } from "svelte/store";

// URL de preview (string src)
export const previewUrl = writable(null);

// URL utilisée par le Canvas
export const imageUrl = writable(null);

// Animation state
export const isPlaying = writable(false);
// rotationSpeed: degrees per second (time-based)
// Default is faster so spinning feels immediate on phones
export const rotationSpeed = writable(360);
export const rotationDirection = writable(1);

// Detected circle metadata (from analyzer)
export const detectedCircle = writable(null); // { x,y,r }
export const detectedCount = writable(0); // number of objects found on the circle
export const suggestedRotationSpeed = writable(1); // degrees/frame suggested
export const detectedPositions = writable([]); // positions along circle (angles / metadata)
// Overlay visibility toggle
export const overlayVisible = writable(false);

// Detection animation state
export const detectionAnimation = writable({
  active: false,
  progress: 0, // 0 to 1
  startTime: 0,
});

// reference to the playing canvas element so other panels can export frames
export const playerCanvas = writable(null);
