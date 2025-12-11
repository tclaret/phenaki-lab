# Phenaki Lab - Component Structure

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        app.html (Root)                          │
│                    + FontAwesome CDN                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├── +layout.svelte
                              │   └── Navigation Header
                              │
                              └── +page.svelte (Main Container)
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            ┌───────▼─────────┐  ┌───▼──────────┐  ┌──▼──────────────┐
            │ FileUploader    │  │ SampleImage  │  │ ImagePreview    │
            │                 │  │ Selector     │  │                 │
            │ • Upload image  │  │              │  │ • Shows preview │
            │ • Set imageUrl  │  │ • Sample imgs│  │ • From store    │
            └─────────────────┘  └──────────────┘  └─────────────────┘
                    │
                    └─────────────┬───────────────────────────────────┐
                                  │                                   │
                         ┌────────▼────────┐                 ┌───────▼───────┐
                         │ CanvasPlayer    │                 │ AnalyzerPanel │
                         │                 │                 │               │
                         │ • Rotation      │                 │ • Detection   │
                         │ • Zoom/Pan      │                 │ • GIF Export  │
                         │ • Flicker FX    │◄────────────────┤ • Controls    │
                         │ • Touch control │                 │ • Toolbar     │
                         │ • Overlay       │                 │               │
                         └─────────────────┘                 └───────┬───────┘
                                                                     │
                                                    ┌────────────────┼────────┐
                                                    │                │        │
                                            ┌───────▼──────┐  ┌──────▼──────┐│
                                            │ Toolbar      │  │ Controls    ││
                                            │              │  │ Panel       ││
                                            │ • Play/Pause │  │             ││
                                            │ • Speed      │  │ • Sectors   ││
                                            │ • Direction  │  │ • Duration  ││
                                            │ • Overlay    │  │ • Easing    ││
                                            └──────────────┘  │ • Flicker   ││
                                                              └─────────────┘│
                                                    ┌──────────────────────────┘
                                                    │
                                            ┌───────▼──────┐
                                            │ Animation    │
                                            │ Panel        │
                                            │ (Legacy?)    │
                                            └──────────────┘
```

## Data Flow (Svelte Stores)

```
┌──────────────────────────────────────────────────────────────┐
│                      $lib/store.js                           │
│                  (Centralized State)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Image State:                                                │
│  • previewUrl ────────────► ImagePreview                     │
│  • imageUrl ──────────────► CanvasPlayer, AnalyzerPanel      │
│                                                              │
│  Animation State:                                            │
│  • isPlaying ─────────────► CanvasPlayer, Toolbar            │
│  • rotationSpeed ─────────► CanvasPlayer, Toolbar            │
│  • rotationDirection ─────► CanvasPlayer, Toolbar            │
│                                                              │
│  Detection State:                                            │
│  • detectedCircle ────────► CanvasPlayer (overlay)           │
│  • detectedCount ─────────► AnalyzerPanel                    │
│  • detectedPositions ─────► CanvasPlayer (overlay)           │
│  • overlayVisible ────────► CanvasPlayer, Toolbar            │
│  • detectionAnimation ────► CanvasPlayer                     │
│                                                              │
│  Export State:                                               │
│  • playerCanvas ──────────► AnalyzerPanel (GIF export)       │
│  • params (sectors, duration, easing, loop)                  │
│                                                              │
│  Flicker Effect:                                             │
│  • flickerEnabled ────────► CanvasPlayer, ControlsPanel      │
│  • flickerFrequency ──────► CanvasPlayer, ControlsPanel      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. **FileUploader**

- Purpose: Upload phenakistoscope images
- Updates: `previewUrl`, `imageUrl`

### 2. **SampleImageSelector**

- Purpose: Select from pre-loaded sample images
- Updates: `previewUrl`, `imageUrl`

### 3. **ImagePreview**

- Purpose: Display preview of selected image
- Reads: `previewUrl`

### 4. **CanvasPlayer** (Main Animation Engine)

- Purpose: Render rotating animation with effects
- Features:
  - Time-based rotation (degrees/second)
  - Touch gestures (pinch zoom, pan, vertical drag for speed)
  - Double-tap to reset view
  - Flicker effect simulation
  - Overlay for detection results
  - Detection animation (radar effect)
- Reads: `imageUrl`, `isPlaying`, `rotationSpeed`, `rotationDirection`, `detectedCircle`, `detectedPositions`, `overlayVisible`, `detectionAnimation`, `flickerEnabled`, `flickerFrequency`
- Updates: `playerCanvas` (canvas reference)

### 5. **AnalyzerPanel**

- Purpose: Image analysis and GIF export
- Features:
  - Circle detection (OpenCV.js)
  - Object counting on circle
  - GIF export
  - Disk slicing
- Includes sub-components:
  - **Toolbar**: Play/pause, speed, direction, overlay toggle
  - **ControlsPanel**: Animation parameters, flicker controls
- Reads: Most stores for analysis
- Updates: `detectedCircle`, `detectedCount`, `detectedPositions`, `suggestedRotationSpeed`, `detectionAnimation`

### 6. **Toolbar** (Child of AnalyzerPanel)

- Purpose: Playback controls
- Buttons: Play/Pause, Speed +/-, Reverse, Overlay toggle
- Updates: `isPlaying`, `rotationSpeed`, `rotationDirection`, `overlayVisible`

### 7. **ControlsPanel** (Child of AnalyzerPanel)

- Purpose: Animation export settings
- Controls: Sectors, Duration, Easing, Loop, Flicker
- Updates: `params`, `flickerEnabled`, `flickerFrequency`

### 8. **AnimationPanel**

- Purpose: Legacy/alternative animation control (may not be actively used)

## Image Processing Utilities

```
$lib/image/
├── countOnCircle.js     → Count objects on detected circle
├── detectCircle.js      → OpenCV circle detection
├── fixPerspective.js    → Perspective correction
├── gifExport.js         → Export to GIF (gif.js)
├── loadImage.js         → Image loading utility
└── sliceDisk.js         → Slice disk into sectors
```

## Key Interactions

1. **User uploads/selects image** → `FileUploader` or `SampleImageSelector` → Sets `imageUrl`
2. **Image loads** → `CanvasPlayer` renders it
3. **User clicks detect** → `AnalyzerPanel` → Runs detection → Updates `detectedCircle`, `detectedPositions`
4. **User enables overlay** → `Toolbar` → `CanvasPlayer` shows detection overlay
5. **User plays animation** → `Toolbar` → `CanvasPlayer` rotates image
6. **User enables flicker** → `ControlsPanel` → `CanvasPlayer` applies flicker effect
7. **User exports GIF** → `AnalyzerPanel` → Captures frames from `playerCanvas` → Generates GIF

## Technology Stack

- **Framework**: SvelteKit 5
- **State Management**: Svelte stores (reactive)
- **Image Processing**: OpenCV.js
- **GIF Generation**: gif.js (web worker)
- **Styling**: Scoped CSS in components
- **Build**: Vite + Static adapter for GitHub Pages
