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
export const rotationDirection = writable(-1);

// Detected circle metadata (from analyzer)
export const detectedCircle = writable(null); // { x,y,r }
export const detectedCount = writable(0); // number of objects found on the circle
export const suggestedRotationSpeed = writable(1); // degrees/frame suggested
export const detectedPositions = writable([]); // positions along circle (angles / metadata)
// Overlay visibility toggle
export const overlayVisible = writable(false);

// Edit mode for positioning before detection
export const editMode = writable(false);

// Confirmed detection state (show crosshair until play is pressed)
export const confirmedDetection = writable(false);

// Canvas transform state (pan and zoom) - used in edit mode to determine rotation center
export const canvasTransform = writable({
  translateX: 0,
  translateY: 0,
  scale: 1
});

// Detection animation state
export const detectionAnimation = writable({
  active: false,
  progress: 0, // 0 to 1
  startTime: 0,
});

// reference to the playing canvas element so other panels can export frames
export const playerCanvas = writable(null);

// Params for GIF generation / export
export const params = writable({
  sectors: 12,
  duration: 2,
  easing: "linear",
  loop: true,
});

// Flicker effect (https://en.wikipedia.org/wiki/Flicker_fusion_threshold)
// Typical human flicker fusion threshold is around 50-60 Hz
export const flickerEnabled = writable(false);
export const flickerFrequency = writable(50); // Hz (flashes per second) - range 40-70 Hz for fusion threshold

// Mobile detection - detect if device is mobile/tablet based on screen width and touch support
export const isMobile = writable(false);
