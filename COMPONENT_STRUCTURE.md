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
                         ┌────────▼────────┐                 ┌───────▼───────────┐
                         │ CanvasPlayer    │                 │ AnalyzerPanel     │
                         │                 │                 │                   │
                         │ • Rotation      │                 │ • Detection       │
                         │ • Zoom/Pan      │                 │ • Edit Mode       │
                         │ • Flicker FX    │◄────────────────┤ • GIF Export      │
                         │ • Edit Mode     │                 │ • Speed Controls  │
                         │ • Touch control │                 │ • Flicker UI      │
                         │ • Overlay       │                 │   (40-70 Hz)      │
                         │ • Radar Anim    │                 │ • Play/Pause      │
                         └─────────────────┘                 │ • Overlay Toggle  │
                                                             └───────────────────┘
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
│  Edit Mode State:                                            │
│  • editMode ──────────────► CanvasPlayer, AnalyzerPanel      │
│  • confirmedDetection ────► CanvasPlayer                     │
│  • canvasTransform ───────► AnalyzerPanel (pan/zoom state)   │
│                                                              │
│  Flicker Fusion Threshold:                                   │
│  • flickerEnabled ────────► CanvasPlayer, AnalyzerPanel      │
│  • flickerFrequency ──────► CanvasPlayer, AnalyzerPanel      │
│    (40-70 Hz range with preset buttons and fine control)    │
│                                                              │
│  Device Detection:                                           │
│  • isMobile ──────────────► CanvasPlayer, AnalyzerPanel      │
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

- Purpose: Render rotating animation with advanced effects
- Features:
  - **Time-based rotation** (degrees/second)
  - **Edit Mode**: Pre-detection positioning with radar animation
    - Continuous radar scan effect while editing
    - Pan and zoom controls for precise positioning
    - Visual crosshair for rotation center alignment
  - **Touch gestures**:
    - Pinch zoom
    - Pan (when zoomed or in edit mode)
    - Vertical drag for speed adjustment (desktop)
    - Mobile-optimized touch handling with preventDefault
  - **Double-tap** to toggle play/pause (disabled in edit mode)
  - **Flicker fusion threshold effect** (40-70 Hz):
    - Variable intensity based on frequency
    - Smooth gradient overlay with vignette
    - Three rendering modes (square wave, sine wave, subtle pulse)
    - Retro color tint at lower frequencies
  - **Detection overlay** with circle and position markers
  - **Radar animation** during detection with looping effect
  - **Confirmed detection crosshair** with pulsing animation
- Reads: `imageUrl`, `isPlaying`, `rotationSpeed`, `rotationDirection`, `detectedCircle`, `detectedPositions`, `overlayVisible`, `detectionAnimation`, `flickerEnabled`, `flickerFrequency`, `editMode`, `confirmedDetection`, `canvasTransform`, `isMobile`
- Updates: `playerCanvas` (canvas reference), `canvasTransform` (pan/zoom state)

### 5. **AnalyzerPanel** (Main Control Panel)

- Purpose: Image analysis, controls, and GIF export - all-in-one panel
- Features:
  - **Circle Detection** (OpenCV.js):
    - Manual detection trigger
    - Edit mode for pre-detection positioning
    - Confirm detection workflow
  - **Object Counting** on detected circle
  - **Speed Controls**:
    - Visual speed display (draggable overlay)
    - Speed increase/decrease buttons (mobile-friendly)
    - Manual speed input
    - Suggested speed from detection
    - Apply suggested speed button
  - **Playback Controls**:
    - Play/Pause button (highlighted when ready)
    - Reverse direction button
    - Show/Hide overlay toggle
  - **Flicker Fusion Threshold Controls** (NEW):
    - Enable/disable checkbox with live frequency badge
    - 5 quick preset buttons (42, 50, 55, 60, 70 Hz) with color coding:
      - 🔴 42 Hz - Strong Flicker (red)
      - 🟠 50 Hz - Critical Threshold (orange)
      - 🔵 55 Hz - Near-Fusion (blue)
      - 🟢 60 Hz - Cinema Standard (green)
      - 🟣 70 Hz - Ultra Smooth (purple)
    - Fine-tune slider (40-70 Hz, 0.5 Hz steps)
    - Real-time status indicator (🔴 Visible / 🟡 Fusion / 🟢 Smooth)
    - Visual guide with contextual descriptions
  - **GIF Export**:
    - Frame count control
    - Export button with progress indicator
    - Uses detected circle and settings
  - **Detection Statistics Display**:
    - Current rotation speed
    - Detected object count
    - Suggested speed
    - Circle coordinates and radius
- Reads: All image, detection, animation, and control stores
- Updates: `detectedCircle`, `detectedCount`, `detectedPositions`, `suggestedRotationSpeed`, `detectionAnimation`, `isPlaying`, `rotationSpeed`, `rotationDirection`, `overlayVisible`, `editMode`, `confirmedDetection`, `flickerEnabled`, `flickerFrequency`

### 6. **Toolbar** (Standalone - Not Currently Used)

- Purpose: Alternative playback controls (legacy component)
- Note: Functionality has been integrated into AnalyzerPanel

### 7. **ControlsPanel** (Standalone - Not Currently Used)

- Purpose: Alternative animation controls (legacy component)
- Note: Flicker controls have been integrated into AnalyzerPanel

### 8. **AnimationPanel** (Legacy)

- Purpose: Alternative animation control (not actively used)

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

1. **User uploads/selects image** → `FileUploader` or `SampleImageSelector` → Sets `imageUrl` and `previewUrl`
2. **Image loads** → `ImagePreview` shows preview, `CanvasPlayer` renders full canvas
3. **User clicks "Edit Detection Position"** → `AnalyzerPanel` → Enters edit mode:
   - Sets `editMode` to true
   - Activates continuous radar animation in `CanvasPlayer`
   - Enables pan/zoom controls for positioning
   - Shows crosshair for rotation center alignment
4. **User adjusts position/zoom** → Touch/mouse interactions in `CanvasPlayer`:
   - Pan: drag to move
   - Zoom: scroll wheel or pinch gesture
   - Mobile: preventDefault ensures touch events work correctly
5. **User clicks "Confirm Detection"** → `AnalyzerPanel` → Runs detection:
   - Exits edit mode
   - Captures pan/zoom transform state
   - Runs OpenCV circle detection
   - Updates `detectedCircle`, `detectedPositions`, `detectedCount`
   - Shows detection results
6. **User enables overlay** → `AnalyzerPanel` checkbox → `CanvasPlayer` shows detection overlay
7. **User plays animation** → `AnalyzerPanel` Play button → `CanvasPlayer` rotates image
8. **User enables flicker** → `AnalyzerPanel` Flicker checkbox:
   - Shows flicker controls with preset buttons
   - User can select quick presets (42, 50, 55, 60, 70 Hz)
   - Or fine-tune with slider (40-70 Hz)
   - `CanvasPlayer` applies real-time flicker effect with variable intensity
9. **User adjusts speed** → Multiple methods in `AnalyzerPanel`:
   - Draggable overlay with +/- buttons
   - Manual input field
   - Apply suggested speed button
   - Vertical drag on canvas (desktop)
10. **User exports GIF** → `AnalyzerPanel` → Captures frames from `playerCanvas` → Generates GIF using gif.js worker

## Technology Stack

- **Framework**: SvelteKit 5
- **State Management**: Svelte stores (reactive)
- **Image Processing**: OpenCV.js
- **GIF Generation**: gif.js (web worker)
- **Styling**: Scoped CSS in components
- **Build**: Vite + Static adapter for GitHub Pages
