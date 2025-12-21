<script>
  import { 
    previewUrl, 
    imageUrl, 
    isPlaying,
    detectedCircle,
    detectedCount,
    detectedPositions,
    confirmedDetection,
    editMode,
    sliceRotationAngle,
    editModeInteraction,
    rotationSpeed,
    suggestedRotationSpeed,
    gifFrameCount,
    userAdjustedSpeed,
    fillOuterCircle,
    outerCircleFillColor
  } from "../store";

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;

    const url = URL.createObjectURL(f);

    // Reset all contexts when loading a new image
    detectedCircle.set(null);
    detectedCount.set(0);
    detectedPositions.set([]);
    confirmedDetection.set(false);
    editMode.set(false);
    sliceRotationAngle.set(0);
    editModeInteraction.set('move-center');
    rotationSpeed.set(0);
    suggestedRotationSpeed.set(1);
    gifFrameCount.set(null);
    userAdjustedSpeed.set(false);
    fillOuterCircle.set(false);
    outerCircleFillColor.set('#000000');

    previewUrl.set(url);
    imageUrl.set(url);

    isPlaying.set(false);
  }
</script>

<label>
  Choose image:
  <input type="file" accept="image/*" on:change={handleFile} />
</label>
