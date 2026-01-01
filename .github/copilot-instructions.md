# Phenakistoscope Lab - AI Assistant Guide

## Project Overview

This is a SvelteKit 5 application that converts vintage phenakistoscope disc images into animated GIFs with real-time rotation and visual effects. The app uses OpenCV.js for circle detection and gif.js for export.

## Architecture

### Centralized State Management (Svelte Stores)

All application state lives in [src/lib/store.js](../src/lib/store.js). Components **never** pass props - they read/write shared stores directly:

```javascript
// Read: $storeName in templates, or subscribe in script
// Write: storeName.set(value)
```

**Key stores:**

- `imageUrl`, `previewUrl` - Image sources
- `isPlaying`, `rotationSpeed`, `rotationDirection` - Animation state
- `detectedCircle`, `detectedCount`, `detectedPositions` - OpenCV detection results
- `editMode`, `confirmedDetection` - Pre-detection positioning workflow
- `flickerEnabled`, `flickerFrequency` - Flicker fusion threshold effect (40-70 Hz)
- `canvasTransform` - Pan/zoom state during edit mode
- `playerCanvas` - Canvas element reference for GIF export

### Component Layout

[src/routes/+page.svelte](../src/routes/+page.svelte) is a flat list of components (no nesting or props):

```svelte
<FileUploader />
<SampleImageSelector />
<ImagePreview />
<CanvasPlayer />
<!-- Animation engine with pan/zoom/touch controls -->
<AnalyzerPanel />
<!-- Detection, controls, GIF export -->
```

See [COMPONENT_STRUCTURE.md](../COMPONENT_STRUCTURE.md) for detailed component interactions and data flows.

### Image Processing Pipeline

[src/lib/image/](../src/lib/image/) contains standalone utility functions:

- `detectCircle.js` - OpenCV.js HoughCircles detection
- `countOnCircle.js` - Count objects along detected circle perimeter
- `gifExport.js` - Multi-frame GIF generation with gif.js web worker
- `fixPerspective.js` - Perspective correction
- `sliceDisk.js` - Slice disc into sectors

**Critical:** These functions use global `cv` (OpenCV.js) loaded via CDN in [src/app.html](../src/app.html). They are synchronous and expect the image to be already loaded.

## Development Workflows

### Build & Dev

```bash
pnpm dev           # Development server
pnpm build         # Build + package for npm publish
pnpm preview       # Preview production build
```

### Testing

Uses **Vitest with browser mode** (Playwright):

```bash
pnpm test:unit     # Watch mode
pnpm test          # Run once
```

Test files: `src/**/*.{spec,test}.{js,ts}` or `src/**/*.svelte.{spec,test}.{js,ts}`

Example: [src/routes/page.svelte.spec.ts](../src/routes/page.svelte.spec.ts) uses `vitest-browser-svelte` for component testing.

### Publishing

This is both a SvelteKit app AND an npm package:

```bash
npm run prepack    # Runs svelte-package + publint
npm publish        # Publish to npm
```

Config: `svelte.config.js` uses `@sveltejs/adapter-static` with GitHub Pages path prefix (`/phenaki-lab`).

## Code Conventions

### State Management Pattern

**Never use props or events between components.** All shared state goes through stores:

```svelte
<script>
	import { imageUrl, isPlaying } from '$lib/store';

	function handleClick() {
		isPlaying.set(!$isPlaying); // Direct store mutation
	}
</script>

{#if $imageUrl}
	<img src={$imageUrl} />
{/if}
```

### Canvas Rendering

[src/lib/components/CanvasPlayer.svelte](../src/lib/components/CanvasPlayer.svelte) is the main animation engine (~1600 lines). Key patterns:

1. **Time-based rotation:** Uses `requestAnimationFrame` with `performance.now()` for smooth 60fps rotation
2. **Touch gestures:** Handles pinch-zoom, pan, and vertical drag speed control with `pointerdown/move/up` events
3. **Edit mode:** Shows radar animation and enables pan/zoom for positioning before detection
4. **Flicker effect:** Applies frequency-based overlay (40-70 Hz) for flicker fusion threshold experiments

### OpenCV.js Integration

OpenCV is loaded from CDN (see [src/app.html](../src/app.html)). Detection workflow:

1. User enters edit mode → pan/zoom to position disc
2. User confirms → `detectCircle()` runs with current transform
3. Detection results stored in `detectedCircle`, `detectedPositions` stores
4. Overlay drawn on canvas using stored detection data

**Important:** Always check `if (typeof cv !== 'undefined')` before using OpenCV functions.

## Common Pitfalls

1. **Don't pass state via props** - Use stores even for component-specific state if it needs to be shared
2. **Canvas transform state** - `canvasTransform` store tracks pan/zoom during edit mode; detection must account for this
3. **Mobile detection** - `isMobile` store set at mount; affects touch handling and UI layout
4. **GIF export** - Requires access to `playerCanvas` store; frames captured from live canvas during rotation
5. **Flicker frequency range** - Constrained to 40-70 Hz; UI shows color-coded presets (red=42Hz, green=60Hz, purple=70Hz)

## File Organization

```
src/
  lib/
    store.js                    # All application state
    components/                 # UI components (no props, use stores)
      CanvasPlayer.svelte       # Main animation engine
      AnalyzerPanel.svelte      # Detection + controls + GIF export
      *.svelte.bak              # Backup files - ignore
    image/                      # Pure utility functions
  routes/
    +page.svelte                # Main layout (flat component list)
    +layout.svelte              # App shell with navigation
```

## External Dependencies

- **OpenCV.js** (CDN) - Circle detection, image processing
- **gif.js** - Multi-threaded GIF encoding with web workers
- **FontAwesome** (CDN) - Icons in UI
- **Svelte 5** - Uses runes (`$state`, `$derived`, `$effect`) in newer code

## When Adding Features

1. **State first:** Add new stores to [src/lib/store.js](../src/lib/store.js)
2. **No props:** Components subscribe to stores, never receive props
3. **Update COMPONENT_STRUCTURE.md:** Document new data flows and interactions
4. **Test with browser mode:** Use Vitest + Playwright for component tests
5. **Check mobile:** Use `isMobile` store to adapt UI/interactions
