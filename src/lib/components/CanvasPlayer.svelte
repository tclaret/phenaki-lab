<script>
  import { onMount, onDestroy } from "svelte";
  import {
    imageUrl,
    isPlaying,
    rotationSpeed,
    rotationDirection,
    detectedCircle,
    detectedPositions,
    overlayVisible,
    playerCanvas,
    detectionAnimation,
  } from "$lib/store";

  let wrapper;
  let canvas;
  let ctx;
  let angle = 0;
  // zoom & pan
  let scale = 1;
  const minScale = 1;
  const maxScale = 4;
  let translateX = 0; // css px relative to center
  let translateY = 0;
  // pointer tracking for pinch/pan
  const pointers = new Map();
  let pinchStartScale = 1;
  let lastPanX = 0;
  let lastPanY = 0;
  let raf;
  let lastTime = 0;
  // Pointer (touch) speed control
  let pointerActive = false;
  let pointerStartY = 0;
  let pointerStartSpeed = 1;
  let showSpeedHUD = false;
  let hudTimeout;
  // Double-tap detection
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;

  let htmlImg = null;
  let imageReady = false;
  let ro;

  // React to image URL changes using the store auto-subscription ($imageUrl)
  $: if ($imageUrl) {
    loadImage($imageUrl);
  } else {
    // clear
    if (htmlImg) htmlImg = null;
    imageReady = false;
    drawFrame();
  }

  function loadImage(url) {
    imageReady = false;
    htmlImg = new Image();
    htmlImg.crossOrigin = "anonymous";

    htmlImg.onload = () => {
      imageReady = true;
      resizeCanvas();
      drawFrame();
    };

    htmlImg.onerror = (e) => {
      console.error("Erreur chargement:", url, e);
      imageReady = false;
    };

    // start load
    htmlImg.src = url;
  }

  function resizeCanvas() {
    if (!canvas || !wrapper) return;
    const r = wrapper.getBoundingClientRect();
    // Use devicePixelRatio for crisp rendering on hi-dpi displays
    const dpr = window.devicePixelRatio || 1;

    // If we have an image, adjust wrapper height to match image aspect ratio
    if (htmlImg && htmlImg.width && htmlImg.height) {
      const imgW = htmlImg.width;
      const imgH = htmlImg.height;
      // compute the minimum CSS height so the rotated image always fits.
      // We render the image to fit within the available width; to ensure the
      // rotated bounding box is contained for any angle, use the diagonal-based
      // formula: desiredH = W * sqrt(imgW^2 + imgH^2) / imgW
      const desiredHeight = Math.min(
        1400,
        Math.max(150, Math.round(r.width * Math.sqrt(imgW * imgW + imgH * imgH) / imgW))
      );
      wrapper.style.height = desiredHeight + "px";
      // recompute rect after changing height
      const rr = wrapper.getBoundingClientRect();
      canvas.style.width = rr.width + "px";
      canvas.style.height = rr.height + "px";
      canvas.width = Math.round(rr.width * dpr);
      canvas.height = Math.round(rr.height * dpr);
    } else {
      canvas.style.width = r.width + "px";
      canvas.style.height = r.height + "px";
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
    }

    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame();
  }

  onMount(() => {
    if (canvas) {
      // expose the canvas element to other components (for GIF export)
      playerCanvas.set(canvas);
      ctx = canvas.getContext("2d");
        // prevent browser from panning the page when touching the canvas
        if (wrapper) wrapper.style.touchAction = 'none';
        // wheel zoom
        if (wrapper) wrapper.addEventListener('wheel', onWheel, { passive: false });
      resizeCanvas();
      ro = new ResizeObserver(() => resizeCanvas());
      if (wrapper) ro.observe(wrapper);
      if (wrapper) {
        wrapper.addEventListener('pointerdown', onPointerDown);
        wrapper.addEventListener('pointermove', onPointerMove);
        wrapper.addEventListener('pointerup', onPointerUp);
        wrapper.addEventListener('pointerleave', onLostPointer);
      }
    }

    return () => {
      if (ro) ro.disconnect();
    };
  });

  // Pointer / touch handlers to change rotation speed by dragging vertically
  function onPointerDown(e) {
    if (!wrapper) return;
    wrapper.setPointerCapture(e.pointerId);
    // track pointer for pinch/zoom
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Double-tap detection: check if this is a second tap within 300ms and ~50px
    const now = Date.now();
    const dx = e.clientX - lastTapX;
    const dy = e.clientY - lastTapY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (now - lastTapTime < 300 && distance < 50) {
      // Double-tap detected: toggle play/pause
      isPlaying.update(v => !v);
      // reset pointers
      pointers.clear();
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;
    lastTapX = e.clientX;
    lastTapY = e.clientY;

    // initialize pan/start values for single pointer
    if (pointers.size === 1) {
      lastPanX = e.clientX;
      lastPanY = e.clientY;
      pointerStartY = e.clientY;
      pointerStartSpeed = $rotationSpeed || 1;
    }
    // initialize pinch
    if (pointers.size === 2) {
      const pts = Array.from(pointers.values());
      pinchStartScale = scale;
      // store start distance for pinch
      onPointerMove.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }

  function onPointerMove(e) {
    if (!wrapper) return;
    // update pointer position
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // if two pointers: pinch zoom
    if (pointers.size === 2) {
      const pts = Array.from(pointers.values());
      const a = pts[0];
      const b = pts[1];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const prevDist = onPointerMove.pinchStartDist || dist;
      const ratio = dist / prevDist;
      let newScale = Math.max(minScale, Math.min(maxScale, pinchStartScale * ratio));

      // adjust translate so the midpoint remains fixed
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const rect = wrapper.getBoundingClientRect();
      const cx = mid.x - (rect.left + cw / 2) - translateX;
      const cy = mid.y - (rect.top + ch / 2) - translateY;
      const s0 = scale;
      const s1 = newScale;
      translateX = translateX - (s1 / s0 - 1) * cx;
      translateY = translateY - (s1 / s0 - 1) * cy;
      scale = newScale;
      showSpeedHUD = true;
      clearTimeout(hudTimeout);
      return;
    }

    // single pointer: if zoomed, pan; else adjust speed vertical drag
    if (pointers.size === 1) {
      const p = pointers.values().next().value;
      if (scale > 1) {
        const dx = e.clientX - lastPanX;
        const dy = e.clientY - lastPanY;
        translateX += dx;
        translateY += dy;
        lastPanX = e.clientX;
        lastPanY = e.clientY;
        drawFrame();
        return;
      } else {
        const dy = pointerStartY - e.clientY; // drag up => positive dy => increase speed
        const sensitivity = 8; // degrees/sec per pixel
        const delta = Math.round(dy * sensitivity);
        const newSpeed = Math.max(10, Math.min(10000, Math.round(pointerStartSpeed + delta)));
        rotationSpeed.set(newSpeed);
        showSpeedHUD = true;
        clearTimeout(hudTimeout);
      }
    }
  }

  function onPointerUp(e) {
    if (!wrapper) return;
    try { wrapper.releasePointerCapture(e.pointerId); } catch (e) {}
    pointerActive = false;
    
    // Keep HUD visible for 4 seconds after releasing
    clearTimeout(hudTimeout);
    showSpeedHUD = true;
    hudTimeout = setTimeout(() => {
      showSpeedHUD = false;
    }, 4000);
      // Cleanup pointers
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        clearTimeout(hudTimeout);
        showSpeedHUD = false;
      }
  }

  function onLostPointer() {
    pointerActive = false;
    clearTimeout(hudTimeout);
    showSpeedHUD = true;
    hudTimeout = setTimeout(() => {
      showSpeedHUD = false;
    }, 4000);
  }

  function onWheel(e) {
    // require ctrlKey or metaKey to avoid interfering with page scroll
    if (!wrapper) return;
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = 1 + (delta > 0 ? 0.1 : -0.1);
    const newScale = Math.max(minScale, Math.min(maxScale, scale * zoomFactor));
    // zoom around mouse position
    const rect = wrapper.getBoundingClientRect();
    const mx = e.clientX - (rect.left + canvas.clientWidth / 2) - translateX;
    const my = e.clientY - (rect.top + canvas.clientHeight / 2) - translateY;
    translateX = translateX - (newScale / scale - 1) * mx;
    translateY = translateY - (newScale / scale - 1) * my;
    scale = newScale;
    drawFrame();
  }

  // (listeners are added/removed in lifecycle hooks)

  onDestroy(() => {
    if (raf) cancelAnimationFrame(raf);
    if (ro) ro.disconnect();
    if (hudTimeout) clearTimeout(hudTimeout);
    if (wrapper) {
      wrapper.removeEventListener('pointerdown', onPointerDown);
      wrapper.removeEventListener('pointermove', onPointerMove);
      wrapper.removeEventListener('pointerup', onPointerUp);
      wrapper.removeEventListener('pointerleave', onLostPointer);
      if (wrapper) wrapper.removeEventListener('wheel', onWheel);
    }
    // clear canvas ref
    playerCanvas.set(null);
  });

  function loop(ts) {
    const isPlayingOrAnimating = $isPlaying || $detectionAnimation.active;
    if (!isPlayingOrAnimating || !imageReady) {
      lastTime = 0;
      if (!isPlayingOrAnimating && raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      return;
    }
    if (!lastTime) lastTime = ts;
    const dt = ts - lastTime; // ms
    lastTime = ts;

    // rotationSpeed is degrees per second
    const degPerSec = $rotationSpeed || 0;
    angle += degPerSec * ($rotationDirection || 1) * (dt / 1000);
    drawFrame();
    raf = requestAnimationFrame(loop);
  }

  // React to play/pause changes
  $: if ($isPlaying || $detectionAnimation.active) {
    // start the loop if not already running
    if (!raf) raf = requestAnimationFrame(loop);
  } else {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
      lastTime = 0;
    }
  }

  function drawFrame() {
    if (!imageReady || !ctx || !htmlImg || !canvas) return;

    // use CSS pixel sizes for layout calculations; ctx is scaled to DPR
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();

    // Calculate "contain" sizing
    const imageRatio = htmlImg.width / htmlImg.height;
    const canvasRatio = cw / ch;

    let dw, dh;
    if (imageRatio > canvasRatio) {
      dw = cw;
      dh = cw / imageRatio;
    } else {
      dh = ch;
      dw = ch * imageRatio;
    }

    // Translate to center plus pan offset, apply zoom by drawing at scaled size,
    // then rotate and draw centered
    const dwZoom = dw * scale;
    const dhZoom = dh * scale;
    ctx.translate(cw / 2 + translateX, ch / 2 + translateY);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.drawImage(htmlImg, -dwZoom / 2, -dhZoom / 2, dwZoom, dhZoom);

    // Draw overlay if enabled and we have a detected circle
    if ($overlayVisible && $detectedCircle) {
      try {
        const c = $detectedCircle;
        // map image-space coords to drawn size (accounting for zoom)
        const scaleImg = (dw * scale) / htmlImg.width; // uniform scale (css pixels)
        const cx = (c.x - htmlImg.width / 2) * scaleImg; // relative to center (css px)
        const cy = (c.y - htmlImg.height / 2) * scaleImg;
        const cr = c.r * scaleImg;

        // circle
        ctx.beginPath();
        ctx.lineWidth = Math.max(2, 2);
        ctx.strokeStyle = 'rgba(255,160,0,0.85)';
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.stroke();

        // draw crosshair at circle center
        ctx.strokeStyle = 'rgba(255,160,0,0.85)';
        ctx.lineWidth = Math.max(2, 2);
        const crossSize = Math.max(15, cr * 0.15);
        ctx.beginPath();
        ctx.moveTo(cx - crossSize, cy);
        ctx.lineTo(cx + crossSize, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - crossSize);
        ctx.lineTo(cx, cy + crossSize);
        ctx.stroke();

        // draw positions as small ticks if available
        if ($detectedPositions && $detectedPositions.length) {
          ctx.fillStyle = 'rgba(0,200,255,0.9)';
          for (const p of $detectedPositions) {
            const ang = p.angle; // radians
            const px = cx + Math.cos(ang) * cr;
            const py = cy + Math.sin(ang) * cr;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(2, Math.round(cr * 0.03)), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } catch (e) {
        console.warn('overlay draw failed', e);
      }
    }

    // Draw detection radar animation if active
    if ($detectionAnimation.active && $detectedCircle) {
      try {
        const c = $detectedCircle;
        const scaleImg = (dw * scale) / htmlImg.width;
        const cx = (c.x - htmlImg.width / 2) * scaleImg;
        const cy = (c.y - htmlImg.height / 2) * scaleImg;
        const cr = c.r * scaleImg;
        const progress = Math.min(1, (Date.now() - $detectionAnimation.startTime) / 2000);

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-dw / 2 - 100, -dh / 2 - 100, dw + 200, dh + 200);

        // Scanning radar rings expanding outward
        ctx.strokeStyle = `rgba(100, 200, 255, ${0.8 * (1 - progress)})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const ringRadius = cr * (0.3 + progress * 1.2 + i * 0.3);
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Rotating scan line
        ctx.strokeStyle = `rgba(100, 200, 255, 0.9)`;
        ctx.lineWidth = 3;
        const scanAngle = progress * Math.PI * 6; // 3 full rotations
        const scanRadius = cr * 1.8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(scanAngle) * scanRadius,
          cy + Math.sin(scanAngle) * scanRadius
        );
        ctx.stroke();

        // Pulsing center point
        const pulseSize = 4 + Math.sin(progress * Math.PI * 4) * 2;
        ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * Math.sin(progress * Math.PI)})`;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Scan text
        ctx.fillStyle = `rgba(100, 200, 255, ${Math.sin(progress * Math.PI)})`;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SCANNING...', cx, cy - cr - 20);
      } catch (e) {
        console.warn('radar animation failed', e);
      }
    }

    ctx.restore();
  }
</script>

<div class="canvas-wrapper" bind:this={wrapper}>
  <canvas bind:this={canvas}></canvas>
  {#if showSpeedHUD}
    <div class="speed-hud">Speed: {($rotationSpeed).toFixed(0)}°/s</div>
  {/if}
</div>

<style>
  .canvas-wrapper {
    width: 100%;
    height: 300px;
    position: relative;
  }
  canvas {
    width: 100%;
    height: 100%;
    background: #111;
    border-radius: 6px;
  }

.speed-hud {
  position: absolute;
  right: 8px;
  top: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 600;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
</style>
