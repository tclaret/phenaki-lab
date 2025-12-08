export const previewUrl: import("svelte/store").Writable<null>;
export const imageUrl: import("svelte/store").Writable<null>;
export const isPlaying: import("svelte/store").Writable<boolean>;
export const rotationSpeed: import("svelte/store").Writable<number>;
export const rotationDirection: import("svelte/store").Writable<number>;
export const detectedCircle: import("svelte/store").Writable<null>;
export const detectedCount: import("svelte/store").Writable<number>;
export const suggestedRotationSpeed: import("svelte/store").Writable<number>;
export const detectedPositions: import("svelte/store").Writable<never[]>;
export const overlayVisible: import("svelte/store").Writable<boolean>;
export const detectionAnimation: import("svelte/store").Writable<{
    active: boolean;
    progress: number;
    startTime: number;
}>;
export const playerCanvas: import("svelte/store").Writable<null>;
