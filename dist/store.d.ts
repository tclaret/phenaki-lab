export const previewUrl: import("svelte/store").Writable<null>;
export const imageUrl: import("svelte/store").Writable<null>;
export const selectedImageName: import("svelte/store").Writable<null>;
export const isPlaying: import("svelte/store").Writable<boolean>;
export const rotationSpeed: import("svelte/store").Writable<number>;
export const rotationDirection: import("svelte/store").Writable<number>;
export const userAdjustedSpeed: import("svelte/store").Writable<boolean>;
export const detectedCircle: import("svelte/store").Writable<null>;
export const detectedCount: import("svelte/store").Writable<number>;
export const suggestedRotationSpeed: import("svelte/store").Writable<number>;
export const detectedPositions: import("svelte/store").Writable<never[]>;
export const overlayVisible: import("svelte/store").Writable<boolean>;
export const editMode: import("svelte/store").Writable<boolean>;
export const confirmedDetection: import("svelte/store").Writable<boolean>;
export const canvasTransform: import("svelte/store").Writable<{
    translateX: number;
    translateY: number;
    scale: number;
}>;
export const detectionAnimation: import("svelte/store").Writable<{
    active: boolean;
    progress: number;
    startTime: number;
}>;
export const playerCanvas: import("svelte/store").Writable<null>;
export const params: import("svelte/store").Writable<{
    sectors: number;
    duration: number;
    easing: string;
    loop: boolean;
}>;
export const flickerEnabled: import("svelte/store").Writable<boolean>;
export const flickerFrequency: import("svelte/store").Writable<number>;
export const isMobile: import("svelte/store").Writable<boolean>;
export const gifFrameCount: import("svelte/store").Writable<null>;
