import { V as store_get, W as attr, X as unsubscribe_stores, Y as attr_class, Z as stringify, _ as clsx, $ as attr_style, a0 as ensure_array_like } from "../../chunks/index2.js";
import { w as writable } from "../../chunks/index.js";
import { b as ssr_context, e as escape_html } from "../../chunks/context.js";
import "gif.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const previewUrl = writable(null);
const imageUrl = writable(null);
const isPlaying = writable(false);
const rotationSpeed = writable(0);
const rotationDirection = writable(1);
const userAdjustedSpeed = writable(false);
const detectedCircle = writable(null);
const detectedCount = writable(0);
const suggestedRotationSpeed = writable(1);
const detectedPositions = writable([]);
const overlayVisible = writable(false);
const editMode = writable(false);
const confirmedDetection = writable(false);
const canvasTransform = writable({
  translateX: 0,
  translateY: 0,
  scale: 1
});
const detectionAnimation = writable({
  active: false,
  progress: 0,
  // 0 to 1
  startTime: 0
});
const playerCanvas = writable(null);
const flickerEnabled = writable(false);
const flickerFrequency = writable(50);
const isMobile = writable(false);
const gifFrameCount = writable(null);
function FileUploader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<label>Choose image: <input type="file" accept="image/*"/></label>`);
  });
}
function ImagePreview($$renderer) {
  var $$store_subs;
  let currentPreview;
  currentPreview = store_get($$store_subs ??= {}, "$previewUrl", previewUrl);
  if (currentPreview) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="preview svelte-1th6cal"><img${attr("src", currentPreview)} alt="Selected disc preview" class="svelte-1th6cal"/></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function CanvasPlayer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canvas;
    let ctx;
    let angle = 0;
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let raf;
    let lastTime = 0;
    let htmlImg = null;
    let imageReady = false;
    function loadImage(url) {
      imageReady = false;
      htmlImg = new Image();
      htmlImg.crossOrigin = "anonymous";
      htmlImg.onload = () => {
        console.log("Image loaded:", url, "Size:", htmlImg.width, "x", htmlImg.height);
        imageReady = true;
        drawFrame();
      };
      htmlImg.onerror = (e) => {
        console.error("Erreur chargement:", url, e);
        imageReady = false;
      };
      htmlImg.src = url;
    }
    onDestroy(() => {
      if (raf) cancelAnimationFrame(raf);
      playerCanvas.set(null);
    });
    function loop(ts) {
      const isPlayingOrAnimating = store_get($$store_subs ??= {}, "$isPlaying", isPlaying) || store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).active || store_get($$store_subs ??= {}, "$editMode", editMode);
      if (!isPlayingOrAnimating || !imageReady) {
        lastTime = 0;
        if (!isPlayingOrAnimating && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        return;
      }
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime;
      lastTime = ts;
      if (store_get($$store_subs ??= {}, "$isPlaying", isPlaying) && !store_get($$store_subs ??= {}, "$editMode", editMode)) {
        const degPerSec = store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed) || 0;
        angle += degPerSec * (store_get($$store_subs ??= {}, "$rotationDirection", rotationDirection) || 1) * (dt / 1e3);
      }
      drawFrame();
      raf = requestAnimationFrame(loop);
    }
    function drawFrame() {
      if (!imageReady || !ctx || !htmlImg || !canvas) {
        console.log("DrawFrame skipped:", { imageReady, ctx: false, htmlImg: !!htmlImg, canvas: false });
        return;
      }
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
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
      const dwZoom = dw * scale;
      const dhZoom = dh * scale;
      let rotationOffsetX = 0;
      let rotationOffsetY = 0;
      if (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle)) {
        const scaleImg = dw / htmlImg.width;
        rotationOffsetX = (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle).x - htmlImg.width / 2) * scaleImg * scale;
        rotationOffsetY = (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle).y - htmlImg.height / 2) * scaleImg * scale;
      }
      ctx.translate(cw / 2 + translateX, ch / 2 + translateY);
      ctx.translate(rotationOffsetX, rotationOffsetY);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(-rotationOffsetX, -rotationOffsetY);
      ctx.drawImage(htmlImg, -dwZoom / 2, -dhZoom / 2, dwZoom, dhZoom);
      if (store_get($$store_subs ??= {}, "$overlayVisible", overlayVisible) && store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle)) {
        try {
          const c = store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle);
          const scaleImg = dw * scale / htmlImg.width;
          const cx = (c.x - htmlImg.width / 2) * scaleImg;
          const cy = (c.y - htmlImg.height / 2) * scaleImg;
          const cr = c.r * scaleImg;
          const radarTime = Date.now() / 1e3;
          const radarAngle = radarTime * Math.PI * 0.5 % (Math.PI * 2);
          const pulsePhase = radarTime * 0.8 % 2;
          const pulseRadius = cr * (0.8 + pulsePhase * 0.4);
          const pulseOpacity = Math.max(0, 0.3 * (1 - pulsePhase / 2));
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 255, ${pulseOpacity})`;
          ctx.lineWidth = 2;
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(radarAngle);
          ctx.strokeStyle = "rgba(0, 255, 255, 0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(cr * 1.1, 0);
          ctx.stroke();
          ctx.restore();
          ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
          ctx.lineWidth = 1;
          for (let i = 0; i < 8; i++) {
            const gridAngle = i / 8 * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(gridAngle) * cr, cy + Math.sin(gridAngle) * cr);
            ctx.stroke();
            if (i % 2 === 0) {
              const angleDeg = Math.round(gridAngle * 180 / Math.PI % 360);
              const labelDist = cr * 1.12;
              const lx = cx + Math.cos(gridAngle) * labelDist;
              const ly = cy + Math.sin(gridAngle) * labelDist;
              ctx.font = "bold 10px monospace";
              ctx.fillStyle = "rgba(0, 255, 255, 0.7)";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(`${angleDeg}°`, lx, ly);
            }
          }
          const mathOpacity = 0.6;
          ctx.font = "11px monospace";
          ctx.textAlign = "left";
          const eqStartX = cx + cr * 0.3;
          const eqStartY = cy - cr * 0.8;
          const lineHeight = 14;
          const equations = [
            `r = ${Math.round(c.r)}px`,
            `θ = ${Math.round(radarAngle * 180 / Math.PI % 360)}°`,
            `ω = ${store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed)}°/s`,
            `n = ${store_get($$store_subs ??= {}, "$detectedCount", detectedCount) || 0}`
          ];
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(eqStartX - 2, eqStartY - 8, 95, equations.length * lineHeight);
          equations.forEach((eq, idx) => {
            const yPos = eqStartY + idx * lineHeight;
            const colors = [
              "rgba(0, 255, 255, ",
              "rgba(255, 0, 255, ",
              "rgba(255, 255, 0, "
            ];
            ctx.fillStyle = colors[idx % 3] + mathOpacity + ")";
            ctx.fillText(eq, eqStartX, yPos);
          });
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          const algoY = cy + cr + 25;
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(cx - 70, algoY - 8, 140, 16);
          ctx.fillStyle = "rgba(100, 255, 200, 0.8)";
          ctx.fillText("CIRCLE DETECTION", cx, algoY);
          for (let i = 0; i < 6; i++) {
            const particleAngle = i / 6 * Math.PI * 2 + radarTime * 0.3;
            const px = cx + Math.cos(particleAngle) * cr;
            const py = cy + Math.sin(particleAngle) * cr;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 === 0 ? "rgba(0, 255, 255, 0.8)" : "rgba(255, 0, 255, 0.8)";
            ctx.fill();
          }
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
          ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 2;
          const crossSize = Math.max(15, cr * 0.15);
          ctx.beginPath();
          ctx.strokeStyle = "rgba(0, 255, 255, 0.9)";
          ctx.moveTo(cx - crossSize, cy);
          ctx.lineTo(cx + crossSize, cy);
          ctx.moveTo(cx, cy - crossSize);
          ctx.lineTo(cx, cy + crossSize);
          ctx.stroke();
          if (store_get($$store_subs ??= {}, "$detectedPositions", detectedPositions) && store_get($$store_subs ??= {}, "$detectedPositions", detectedPositions).length) {
            ctx.fillStyle = "rgba(255, 0, 255, 0.9)";
            for (const p of store_get($$store_subs ??= {}, "$detectedPositions", detectedPositions)) {
              const ang = p.angle;
              const px = cx + Math.cos(ang) * cr;
              const py = cy + Math.sin(ang) * cr;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } catch (e) {
          console.warn("overlay draw failed", e);
        }
      }
      if (store_get($$store_subs ??= {}, "$editMode", editMode) && !store_get($$store_subs ??= {}, "$confirmedDetection", confirmedDetection)) {
        try {
          let progress;
          if (store_get($$store_subs ??= {}, "$editMode", editMode)) {
            const startTime = store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).startTime || 0;
            const elapsed = startTime > 0 ? Date.now() - startTime : Date.now();
            progress = elapsed % 2e3 / 2e3;
          } else {
            progress = Math.min(1, (Date.now() - store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).startTime) / 2e3);
          }
          ctx.fillStyle = store_get($$store_subs ??= {}, "$editMode", editMode) ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)";
          ctx.fillRect(-dw / 2 - 100, -dh / 2 - 100, dw + 200, dh + 200);
          if (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle)) {
            const c = store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle);
            const scaleImg = dw * scale / htmlImg.width;
            const cx = (c.x - htmlImg.width / 2) * scaleImg;
            const cy = (c.y - htmlImg.height / 2) * scaleImg;
            const cr = c.r * scaleImg;
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.8 * (1 - progress)})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
              const ringRadius = cr * (0.3 + progress * 1.2 + i * 0.3);
              ctx.beginPath();
              ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(100, 200, 255, 0.9)`;
            ctx.lineWidth = 3;
            const scanAngle = progress * Math.PI * 6;
            const scanRadius = cr * 1.8;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(scanAngle) * scanRadius, cy + Math.sin(scanAngle) * scanRadius);
            ctx.stroke();
            const pulseSize = 4 + Math.sin(progress * Math.PI * 4) * 2;
            ctx.fillStyle = `rgba(100, 200, 255, ${0.9 * Math.sin(progress * Math.PI)})`;
            ctx.beginPath();
            ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(100, 200, 255, ${Math.sin(progress * Math.PI)})`;
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("SCANNING...", cx, cy - cr - 20);
          } else {
            const maxRadius = Math.max(dw, dh) / 2;
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.6})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
              const ringRadius = maxRadius * (progress + i * 0.25) % 1;
              const opacity = 1 - ringRadius;
              ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.6})`;
              ctx.beginPath();
              ctx.arc(0, 0, ringRadius * maxRadius, 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.strokeStyle = `rgba(100, 200, 255, 0.8)`;
            ctx.lineWidth = 3;
            const scanAngle = progress * Math.PI * 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(scanAngle) * maxRadius, Math.sin(scanAngle) * maxRadius);
            ctx.stroke();
            ctx.fillStyle = `rgba(100, 200, 255, ${0.8 + 0.2 * Math.sin(progress * Math.PI * 4)})`;
            ctx.font = "bold 18px sans-serif";
            ctx.textAlign = "center";
            if (store_get($$store_subs ??= {}, "$editMode", editMode)) {
              ctx.fillText("⚙️ EDIT MODE - ADJUST POSITION & ZOOM", 0, -60);
              ctx.font = "bold 16px sans-serif";
              ctx.fillStyle = "rgba(255, 200, 100, 0.95)";
              ctx.fillText("🎯 Align crosshair with rotation center", 0, -20);
              ctx.font = "14px sans-serif";
              ctx.fillStyle = "rgba(200, 255, 200, 0.9)";
              ctx.fillText("👆 Drag to move  •  🔍 Scroll/Pinch to zoom", 0, 20);
              ctx.font = "bold 14px sans-serif";
              ctx.fillStyle = "rgba(100, 255, 100, 0.9)";
              ctx.fillText('Click "Confirm Detection" when ready', 0, 60);
            } else {
              ctx.fillText("ANALYZING IMAGE...", 0, -20);
              ctx.font = "12px sans-serif";
              ctx.fillText(`${Math.round(progress * 100)}%`, 0, 10);
            }
          }
        } catch (e) {
          console.warn("radar animation failed", e);
        }
      }
      if (store_get($$store_subs ??= {}, "$flickerEnabled", flickerEnabled) && store_get($$store_subs ??= {}, "$isPlaying", isPlaying)) {
        const flickerPeriod = 1e3 / store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency);
        const phase = lastTime % flickerPeriod / flickerPeriod;
        const fusionFactor = Math.max(0, Math.min(1, (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) - 40) / 30));
        let flickerIntensity;
        if (fusionFactor < 0.33) {
          flickerIntensity = phase > 0.5 ? 0.85 : 0;
        } else if (fusionFactor < 0.67) {
          const smoothPhase = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
          flickerIntensity = smoothPhase > 0.6 ? 0.6 : 0;
        } else {
          const smoothPhase = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
          flickerIntensity = smoothPhase * 0.3;
        }
        if (flickerIntensity > 0.05) {
          const gradient = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.max(cw, ch) * 0.8);
          gradient.addColorStop(0, `rgba(0, 0, 0, ${flickerIntensity * 0.7})`);
          gradient.addColorStop(0.5, `rgba(0, 0, 0, ${flickerIntensity})`);
          gradient.addColorStop(1, `rgba(0, 0, 0, ${flickerIntensity * 0.9})`);
          ctx.fillStyle = gradient;
          ctx.fillRect(-cw, -ch, cw * 3, ch * 3);
          if (fusionFactor < 0.5) {
            ctx.fillStyle = `rgba(20, 20, 40, ${flickerIntensity * 0.15})`;
            ctx.fillRect(-cw, -ch, cw * 3, ch * 3);
          }
        }
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        const badgeX = -cw / 2 + 15;
        const badgeY = -ch / 2 + 15;
        let badgeColor, label;
        if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 50) {
          badgeColor = "rgba(255, 100, 100, 0.9)";
          label = "FLICKER";
        } else if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 60) {
          badgeColor = "rgba(255, 180, 50, 0.9)";
          label = "THRESHOLD";
        } else {
          badgeColor = "rgba(100, 220, 100, 0.9)";
          label = "FUSED";
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, 85, 18, 4);
        ctx.fill();
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = badgeColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency)}Hz`, badgeX + 5, badgeY + 9);
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText(label, badgeX + 42, badgeY + 9);
        ctx.restore();
      }
      ctx.restore();
      if (store_get($$store_subs ??= {}, "$editMode", editMode) || store_get($$store_subs ??= {}, "$confirmedDetection", confirmedDetection)) {
        const pulsePhase = Date.now() % 1e3 / 1e3;
        const pulseAlpha = 0.7 + 0.3 * Math.sin(pulsePhase * Math.PI * 2);
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        const sliceCount = store_get($$store_subs ??= {}, "$gifFrameCount", gifFrameCount) || store_get($$store_subs ??= {}, "$detectedCount", detectedCount) || 12;
        if (store_get($$store_subs ??= {}, "$editMode", editMode) && sliceCount > 0) {
          const sliceRadius = Math.min(cw, ch) * 0.3;
          const angleStep = Math.PI * 2 / sliceCount;
          for (let i = 0; i < sliceCount; i++) {
            const startAngle = i * angleStep - Math.PI / 2;
            const endAngle = startAngle + angleStep;
            const sliceAlpha = 0.15 + 0.1 * (i % 2 * 0.5);
            ctx.fillStyle = `rgba(100, 200, 255, ${sliceAlpha})`;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, sliceRadius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 * pulseAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(startAngle) * sliceRadius, Math.sin(startAngle) * sliceRadius);
            ctx.stroke();
          }
          ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 * pulseAlpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, sliceRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(255, 100, 0, ${pulseAlpha})`;
        ctx.lineWidth = 4;
        const crossSize = Math.min(cw, ch) * 0.1;
        ctx.beginPath();
        ctx.arc(0, 0, crossSize * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-crossSize, 0);
        ctx.lineTo(crossSize, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -crossSize);
        ctx.lineTo(0, crossSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 10 + 3 * Math.sin(pulsePhase * Math.PI * 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 0, ${pulseAlpha})`;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fill();
        ctx.restore();
      }
    }
    if (store_get($$store_subs ??= {}, "$editMode", editMode)) {
      translateX = 0;
      translateY = 0;
      scale = 1;
      drawFrame();
    }
    canvasTransform.set({ translateX, translateY, scale });
    if (store_get($$store_subs ??= {}, "$isPlaying", isPlaying)) {
      confirmedDetection.set(false);
    }
    if (store_get($$store_subs ??= {}, "$imageUrl", imageUrl)) {
      loadImage(store_get($$store_subs ??= {}, "$imageUrl", imageUrl));
    } else {
      if (htmlImg) htmlImg = null;
      imageReady = false;
      drawFrame();
    }
    if (store_get($$store_subs ??= {}, "$gifFrameCount", gifFrameCount) !== void 0) {
      drawFrame();
    }
    {
      const shouldAnimate = store_get($$store_subs ??= {}, "$isPlaying", isPlaying) || store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).active || store_get($$store_subs ??= {}, "$editMode", editMode);
      if (shouldAnimate) {
        if (!raf) {
          raf = requestAnimationFrame(loop);
        }
      } else {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = null;
          lastTime = 0;
        }
      }
    }
    $$renderer2.push(`<div${attr_class(
      `canvas-wrapper ${stringify(
        // use CSS pixel sizes for layout calculations; ctx is scaled to DPR
        // Calculate "contain" sizing
        // Translate to center plus pan offset, apply zoom by drawing at scaled size,
        // then rotate and draw centered
        // If we have a detected circle, rotate around its center instead of image center
        // Calculate offset from image center to circle center in image space
        // Scale factor from image pixels to drawn size
        // Translate to the detected circle center
        // Translate back to draw the image centered at the rotation point
        // Draw overlay if enabled and we have a detected circle
        // map image-space coords to drawn size (accounting for zoom)
        // uniform scale (css pixels)
        // relative to center (css px)
        // Retro-futuristic radar animation (optimisé)
        // Un seul anneau pulsant (optimisé)
        // Balayage radar simplifié (sans gradient coûteux)
        // Grille simplifiée (8 lignes au lieu de 12)
        // Angles tous les 90°
        // Calculs mathématiques simplifiés (sans animation lourde)
        // Fond unique pour toutes les équations
        // Badge simplifié
        // 6 particules au lieu de 16
        // Main circle simplifié (sans gradient coûteux)
        // Crosshair simplifié
        // Positions détectées simplifiées
        // Draw detection radar animation only in edit mode (not after confirmation)
        // In edit mode, loop the animation continuously
        // Continuous loop animation - use a fallback startTime if not set
        // Loop every 2 seconds
        // Normal one-time animation
        // Semi-transparent overlay (darker in edit mode)
        // If circle is detected, show targeted animation
        // Scanning radar rings expanding outward
        // Rotating scan line
        // 3 full rotations
        // Pulsing center point
        // Scan text
        // No circle yet, show generic scanning animation
        // Expanding rings from center
        // Rotating scan line
        // Center text
        // Main title
        // Instructions
        // Hint at bottom
        // Progress indicator
        // Flicker fusion threshold effect (simulates persistence of vision)
        // ms per cycle
        // 0 to 1
        // Calculate overlay intensity based on frequency (fusion threshold simulation)
        // Below 50 Hz: strong, visible flicker
        // 50-60 Hz: moderate flicker (near fusion threshold)
        // Above 60 Hz: subtle flicker (above fusion threshold)
        // 0 at 40Hz, 1 at 70Hz
        // Create flicker with varying sharpness
        // Low frequency: sharp square wave flicker
        // Medium frequency: softer transition
        // High frequency: very subtle pulsing (near/above fusion)
        // Apply the overlay with a gradient effect
        // Create a subtle vignette effect for the overlay
        // Add a subtle color tint at lower frequencies for retro effect
        // Frequency indicator (small, discrete badge)
        // Position in top-left corner (visible when scrolling)
        // Determine color based on frequency
        // Red - strong flicker
        // Orange - threshold
        // Green - fused
        // Background badge
        // Frequency text
        // Status label
        // Display center crosshair in edit mode OR after confirmed detection (AFTER restore, so it stays fixed)
        // 0 to 1 every second
        // Draw in canvas coordinates (center of viewport)
        // Draw "pie slices" in edit mode based on user-entered frame count
        // Use gifFrameCount if set, otherwise fall back to detectedCount, with minimum of 6
        // Draw pie slices
        // Start from top
        // Alternating colors for each slice
        // Draw slice borders
        // Outer circle for the pie
        // Outer circle (pulsing)
        // Horizontal line
        // Vertical line
        // Center circle (larger and more visible with pulse)
        // White outline for better visibility
        // Small center dot
        store_get($$store_subs ??= {}, "$editMode", editMode) ? "edit-mode" : ""
      )}`,
      "svelte-byh4af"
    )}><canvas class="svelte-byh4af"></canvas> `);
    if (store_get($$store_subs ??= {}, "$isMobile", isMobile)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="speed-hud svelte-byh4af">Speed: ${escape_html(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed).toFixed(0))}°/s</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$editMode", editMode)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="edit-mode-indicator svelte-byh4af">⚙️ EDIT MODE - Drag to position • Scroll to zoom</div> <div class="frame-counter svelte-byh4af"><button class="frame-btn svelte-byh4af" title="Decrease frame count">−</button> <div class="frame-display svelte-byh4af"><div class="frame-number svelte-byh4af">${escape_html(store_get($$store_subs ??= {}, "$gifFrameCount", gifFrameCount) || 12)}</div> <div class="frame-label svelte-byh4af">frames</div></div> <button class="frame-btn svelte-byh4af" title="Increase frame count">+</button></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function AnalyzerPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let canSaveGif, optsGifCount, _detectedCircle, _detectedCount, _suggested, _overlay;
    let busy = false;
    let hasPlayed = false;
    let manualSpeed = 0;
    let exporting = false;
    let gifFps = 15;
    if (store_get($$store_subs ??= {}, "$isPlaying", isPlaying)) {
      hasPlayed = true;
    }
    canSaveGif = store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle) && store_get($$store_subs ??= {}, "$confirmedDetection", confirmedDetection) && store_get($$store_subs ??= {}, "$isPlaying", isPlaying) && store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed) > 0 && store_get($$store_subs ??= {}, "$playerCanvas", playerCanvas);
    {
      console.log("GIF Save Conditions:", {
        detectedCircle: !!store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle),
        confirmedDetection: store_get($$store_subs ??= {}, "$confirmedDetection", confirmedDetection),
        hasPlayed,
        userAdjustedSpeed: store_get($$store_subs ??= {}, "$userAdjustedSpeed", userAdjustedSpeed),
        playerCanvas: !!store_get($$store_subs ??= {}, "$playerCanvas", playerCanvas),
        isPlaying: store_get($$store_subs ??= {}, "$isPlaying", isPlaying),
        rotationSpeed: store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed),
        canSaveGif
      });
    }
    manualSpeed = Number(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed) || 0);
    optsGifCount = store_get($$store_subs ??= {}, "$gifFrameCount", gifFrameCount);
    _detectedCircle = store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle);
    _detectedCount = store_get($$store_subs ??= {}, "$detectedCount", detectedCount);
    _suggested = store_get($$store_subs ??= {}, "$suggestedRotationSpeed", suggestedRotationSpeed);
    _overlay = store_get($$store_subs ??= {}, "$overlayVisible", overlayVisible);
    $$renderer2.push(`<div class="panel svelte-14nyow8">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;" class="svelte-14nyow8"><button${attr_class(clsx(_detectedCircle && !store_get($$store_subs ??= {}, "$isPlaying", isPlaying) ? "play-highlight" : ""), "svelte-14nyow8", {
      "pause-subtle": store_get($$store_subs ??= {}, "$isPlaying", isPlaying) && !_detectedCircle
    })}${attr("disabled", !store_get($$store_subs ??= {}, "$imageUrl", imageUrl), true)}>${escape_html(store_get($$store_subs ??= {}, "$isPlaying", isPlaying) ? "Pause" : "Play")}</button> <button class="svelte-14nyow8">Reverse</button> `);
    if (store_get($$store_subs ??= {}, "$editMode", editMode)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="confirm-btn svelte-14nyow8"${attr("disabled", busy, true)}>Confirm Detection</button> <button class="svelte-14nyow8">Cancel</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button${attr_class(clsx(!_detectedCircle ? "detect-btn-required" : ""), "svelte-14nyow8")}${attr("disabled", !store_get($$store_subs ??= {}, "$imageUrl", imageUrl), true)}>Detect Circle &amp; Count</button>`);
    }
    $$renderer2.push(`<!--]--> <button${attr("disabled", !_suggested, true)} class="svelte-14nyow8">Apply Suggested Speed</button> <div class="gif-export-group svelte-14nyow8"><button class="save-gif-btn svelte-14nyow8"${attr("disabled", !canSaveGif || exporting, true)}>${escape_html("💾 Save GIF")}</button> <label style="display:flex;align-items:center;gap:6px;" class="svelte-14nyow8"><span style="font-size:12px;opacity:0.8;" class="svelte-14nyow8">Frames:</span> <input type="number" min="6" step="1"${attr("placeholder", _detectedCount ? `Auto (${_detectedCount * 2})` : "Auto (24)")}${attr("value", store_get($$store_subs ??= {}, "$gifFrameCount", gifFrameCount))} style="width:80px;padding:4px;border-radius:4px;border:1px solid #ccc;" class="svelte-14nyow8"/> <span style="font-size:11px;opacity:0.6;" title="Leave empty for auto-detection" class="svelte-14nyow8">`);
    if (optsGifCount) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`Manual`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (_detectedCount) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Auto (x2)`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`Auto`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></span></label> <label style="display:flex;align-items:center;gap:6px;" class="svelte-14nyow8"><span style="font-size:12px;opacity:0.8;" class="svelte-14nyow8">FPS:</span> `);
    $$renderer2.select(
      {
        value: gifFps,
        style: "padding:4px;border-radius:4px;border:1px solid #ccc;background:#333;color:white;",
        class: ""
      },
      ($$renderer3) => {
        $$renderer3.option(
          { value: 3, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`3 (Ultra Slow)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 5, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`5 (Very Slow)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 8, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`8 (Slow)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 10, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`10 (Classic)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 15, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`15 (Natural)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 20, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`20 (Smooth)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 24, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`24 (Cinema)`);
          },
          "svelte-14nyow8"
        );
        $$renderer3.option(
          { value: 30, class: "" },
          ($$renderer4) => {
            $$renderer4.push(`30 (Fast)`);
          },
          "svelte-14nyow8"
        );
      },
      "svelte-14nyow8"
    );
    $$renderer2.push(`</label></div> <label style="display:flex;align-items:center;gap:6px;margin-left:6px;" class="svelte-14nyow8"><input type="checkbox"${attr("checked", _overlay, true)} class="svelte-14nyow8"/> <span class="svelte-14nyow8">Show Overlay</span></label> <label style="display:flex;align-items:center;gap:6px;margin-left:6px;" class="svelte-14nyow8"><input type="checkbox"${attr("checked", store_get($$store_subs ??= {}, "$flickerEnabled", flickerEnabled), true)} class="svelte-14nyow8"/> <span class="svelte-14nyow8">Flicker Effect</span> `);
    if (store_get($$store_subs ??= {}, "$flickerEnabled", flickerEnabled)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<span style="background: #4a9eff; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75em; font-weight: bold; margin-left: 4px;" class="svelte-14nyow8">${escape_html(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency))} Hz</span>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></label></div> `);
    if (store_get($$store_subs ??= {}, "$flickerEnabled", flickerEnabled)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div style="margin-top: 16px; padding: 12px; background: rgba(74, 158, 255, 0.08); border-radius: 6px; border: 1px solid rgba(74, 158, 255, 0.2);" class="svelte-14nyow8"><div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;" class="svelte-14nyow8"><div style="font-weight: 600; color: #4a9eff; font-size: 0.95em;" class="svelte-14nyow8">⚡ Flicker Fusion Threshold</div> <a href="https://en.wikipedia.org/wiki/Flicker_fusion_threshold" target="_blank" rel="noopener noreferrer" style="display: flex; align-items: center; gap: 4px; font-size: 0.75em; color: #aaa; text-decoration: none; opacity: 0.7; transition: opacity 0.2s;" title="Learn more on Wikipedia" class="svelte-14nyow8"><svg width="14" height="14" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" class="svelte-14nyow8"><path fill="currentColor" d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 217.5c-53.8 0-97.5-43.7-97.5-97.5S66.2 22.5 120 22.5s97.5 43.7 97.5 97.5-43.7 97.5-97.5 97.5zm-7.5-165h15v90h-15zm0 105h15v15h-15z" class="svelte-14nyow8"></path></svg> <span class="svelte-14nyow8">Wikipedia</span></a></div> <div style="margin-bottom: 12px;" class="svelte-14nyow8"><div style="font-size: 0.85em; color: #aaa; margin-bottom: 6px;" class="svelte-14nyow8">Quick Presets:</div> <div style="display: flex; gap: 6px; flex-wrap: wrap;" class="svelte-14nyow8"><button class="flicker-preset-btn svelte-14nyow8"${attr_style(`padding: 8px 14px; border: 1px solid ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 42 ? "#ff6b6b" : "#555")}; background: ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 42 ? "#ff6b6b" : "#333")}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;`)}>42 Hz</button> <button class="flicker-preset-btn svelte-14nyow8"${attr_style(`padding: 8px 14px; border: 1px solid ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 50 ? "#ffa500" : "#555")}; background: ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 50 ? "#ffa500" : "#333")}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;`)}>50 Hz</button> <button class="flicker-preset-btn svelte-14nyow8"${attr_style(`padding: 8px 14px; border: 1px solid ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 55 ? "#4a9eff" : "#555")}; background: ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 55 ? "#4a9eff" : "#333")}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;`)}>55 Hz</button> <button class="flicker-preset-btn svelte-14nyow8"${attr_style(`padding: 8px 14px; border: 1px solid ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 60 ? "#51cf66" : "#555")}; background: ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 60 ? "#51cf66" : "#333")}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;`)}>60 Hz</button> <button class="flicker-preset-btn svelte-14nyow8"${attr_style(`padding: 8px 14px; border: 1px solid ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 70 ? "#845ef7" : "#555")}; background: ${stringify(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) === 70 ? "#845ef7" : "#333")}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;`)}>70 Hz</button></div></div> <div style="margin-top: 12px;" class="svelte-14nyow8"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;" class="svelte-14nyow8"><span style="font-size: 0.85em; color: #ccc;" class="svelte-14nyow8">Fine Tune:</span> <span style="font-size: 1.1em; font-weight: bold; color: #4a9eff;" class="svelte-14nyow8">${escape_html(store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency))} Hz</span></div> <input type="range" min="40" max="70" step="0.5"${attr("value", store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency))} style="width: 100%; cursor: pointer;" class="svelte-14nyow8"/> <div style="display: flex; justify-content: space-between; font-size: 0.7em; color: #666; margin-top: 4px;" class="svelte-14nyow8"><span class="svelte-14nyow8">40 Hz</span> <span style="color: #4a9eff; font-weight: 500;" class="svelte-14nyow8">`);
      if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 48) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`🔴 Visible`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 58) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`🟡 Fusion`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`🟢 Smooth`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></span> <span class="svelte-14nyow8">70 Hz</span></div></div> <div style="margin-top: 10px; padding: 8px; background: rgba(74, 158, 255, 0.12); border-radius: 4px; font-size: 0.8em;" class="svelte-14nyow8"><div style="font-weight: 500; color: #4a9eff; margin-bottom: 3px;" class="svelte-14nyow8">`);
      if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 48) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`⚡ Strong Flicker`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 52) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`🎯 Critical Threshold`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 58) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`✨ Near-Fusion`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 62) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`🎬 Cinema (60 Hz)`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`🌟 Ultra Smooth`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> <div style="color: #aaa; font-size: 0.9em;" class="svelte-14nyow8">`);
      if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 48) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`Noticeable flicker - classic phenakistoscope effect`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 52) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`Flicker begins to fuse - critical threshold`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 58) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`Subtle pulsing - artistic sweet spot`);
          } else {
            $$renderer2.push("<!--[!-->");
            if (store_get($$store_subs ??= {}, "$flickerFrequency", flickerFrequency) < 62) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`Standard cinema/TV rate - minimal flicker`);
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`Above fusion threshold - very smooth`);
            }
            $$renderer2.push(`<!--]-->`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`speed-control ${stringify("")} ${stringify("")} ${stringify(store_get($$store_subs ??= {}, "$isMobile", isMobile) ? "mobile" : "")}`, "svelte-14nyow8")}${attr_style(`left: ${stringify(16)}px; top: ${stringify(16)}px;`)}>`);
      if (store_get($$store_subs ??= {}, "$isMobile", isMobile)) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="drag-handle svelte-14nyow8" title="Drag to move">⋮⋮</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div style="display:flex;gap:12px;align-items:center;" class="svelte-14nyow8"><button class="speed-btn svelte-14nyow8">−</button> <div style="text-align:center;min-width:120px;" class="svelte-14nyow8"><div class="speed-display svelte-14nyow8">${escape_html(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed).toFixed(0))}°/s</div> <div style="font-size:11px;opacity:0.6;margin-top:4px;" class="svelte-14nyow8">Rotation Speed</div></div> <button class="speed-btn svelte-14nyow8">+</button></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div style="margin-top:12px;" class="svelte-14nyow8"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;" class="svelte-14nyow8"><div class="svelte-14nyow8"><strong class="svelte-14nyow8">Current Speed:</strong> ${escape_html(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed).toFixed(0))}°/s | `);
    if (store_get($$store_subs ??= {}, "$isMobile", isMobile)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<em style="font-size:12px;opacity:0.7;" class="svelte-14nyow8">(Use +/− buttons above to adjust speed)</em>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<em style="font-size:12px;opacity:0.7;" class="svelte-14nyow8">(Touch: drag up to speed up, down to slow down)</em>`);
    }
    $$renderer2.push(`<!--]--></div> <div style="display:flex;gap:6px;align-items:center;" class="svelte-14nyow8"><label for="manual-speed-input" style="font-size:12px;" class="svelte-14nyow8">Type speed:</label> <input id="manual-speed-input" type="number" min="1" step="1"${attr("value", manualSpeed)} style="width:100px;padding:6px;border-radius:4px;border:1px solid #ccc;" class="svelte-14nyow8"/> <button class="svelte-14nyow8">Set</button></div></div> <div class="svelte-14nyow8"><strong class="svelte-14nyow8">Detected count:</strong> ${escape_html(_detectedCount ?? 0)}</div> <div class="svelte-14nyow8"><strong class="svelte-14nyow8">Suggested speed:</strong> ${escape_html(_suggested ? _suggested.toFixed(0) : "—")}°/s</div> `);
    if (_detectedCircle) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="svelte-14nyow8"><strong class="svelte-14nyow8">Circle:</strong> x=${escape_html(Math.round(_detectedCircle.x))}, y=${escape_html(Math.round(_detectedCircle.y))}, r=${escape_html(Math.round(_detectedCircle.r))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function SampleImageSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const samples = [
      {
        name: "Woman Chopping Tree",
        file: "WomanChoppingTree.jpg",
        repo: "old"
      },
      { name: "Dancing", file: "Dancing.jpg", repo: "old" },
      { name: "Jongleur", file: "Jongleur.png", repo: "old" },
      { name: "a_cheval", file: "a_cheval.png", repo: "old" },
      { name: "McLean_1", file: "McLean_1.png", repo: "old" },
      {
        name: "Gernamy_1949",
        file: "Gernamy_1949_R_Balzer.png",
        repo: "old"
      },
      {
        name: "AEO175939",
        file: "AEO175939_PhenakistoscopeGiroux60.jpg",
        repo: "old"
      },
      {
        name: "AEO185553",
        file: "AEO185553_PhenakistiscopeDisc_ManInBlueAndRed.jpg",
        repo: "old"
      },
      {
        name: "medium_1990_5036_3369",
        file: "medium_1990_5036_3369.jpg",
        repo: "old"
      },
      {
        name: "medium_a001813b",
        file: "medium_a001813b.jpg",
        repo: "old"
      },
      {
        name: "tumblr_obd6fh",
        file: "tumblr_obd6fhGFSZ1r9jbwno1_500.png",
        repo: "old"
      },
      {
        name: "tumblr_oc1cz",
        file: "tumblr_oc1czn99ZM1r9jbwno1_500.png",
        repo: "old"
      },
      {
        name: "Phantasmascope Faces",
        file: "Phantasmascope_faces.png",
        repo: "old"
      },
      {
        name: "722a6790240569.5e126845d9b56",
        file: "722a6790240569.5e126845d9b56.png",
        repo: "old"
      },
      {
        name: "Fantascope Disc 1833",
        file: "fantascope-disc-1833.png",
        repo: "old"
      },
      { name: "Face", file: "a_face__.jpg", repo: "new" },
      { name: "Culbute", file: "culbute.jpg", repo: "new" },
      { name: "Grenouille", file: "Grenouille__.jpg", repo: "new" },
      { name: "Oh Soccer", file: "oh_soccer.jpg", repo: "new" },
      {
        name: "Un Grand Un Petit",
        file: "un_grand_un_petit.jpg",
        repo: "new"
      },
      {
        name: "Autre Culbutte",
        file: "autre_culbutte.jpg",
        repo: "new"
      },
      { name: "Dancing 2", file: "dancing_.jpg", repo: "new" },
      {
        name: "Il Pompe de l'eau",
        file: "il_pompe_de_leau.jpg",
        repo: "new"
      },
      { name: "Porceline", file: "porceline.jpg", repo: "new" },
      { name: "Volants", file: "volants_.png", repo: "new" },
      { name: "Ce Qui", file: "ce_qui.jpg", repo: "new" },
      { name: "Des Anges", file: "des_anges.jpg", repo: "new" },
      { name: "Moulin", file: "moulin_.jpg", repo: "new" },
      { name: "Rats", file: "rats__.jpg", repo: "new" },
      {
        name: "Corde à Danser",
        file: "corde_a_denser_.jpg",
        repo: "new"
      },
      { name: "Ecureuil", file: "ecureuil.jpg", repo: "new" },
      { name: "Noel Noel", file: "noel_noel.jpg", repo: "new" },
      { name: "Tirreur", file: "tirreur_.jpg", repo: "new" },
      { name: "C Pastel", file: "c_pastel.jpg", repo: "new" },
      { name: "Géométrique", file: "geometrique.jpg", repo: "new" },
      {
        name: "Nuages en Scie",
        file: "nuages_en_scie.jpg",
        repo: "new"
      },
      { name: "Tons Pastels", file: "tons_pastels.jpg", repo: "new" },
      { name: "Des Ouiseaux", file: "DesOuaisaux.png", repo: "new" },
      {
        name: "Feels Like Flying",
        file: "feels_like_flying.png",
        repo: "new"
      },
      { name: "Gros Meusieur", file: "GrosMeusieur.png", repo: "new" },
      {
        name: "Jongle avec les Otaries",
        file: "Jongle_avec_les_otaries.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 1",
        file: "cinemateque_francaise_1.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 2",
        file: "cinemateque_francaise_2.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 3",
        file: "cinemateque_francaise_3.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 4",
        file: "cinemateque_francaise_4.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 5",
        file: "cinemateque_francaise_5.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 6",
        file: "cinemateque_francaise_6.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 7",
        file: "cinemateque_francaise_7.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 8",
        file: "cinemateque_francaise_8.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 9",
        file: "cinemateque_francaise_9.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 10",
        file: "cinemateque_francaise_10.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 11",
        file: "cinemateque_francaise_11.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 12",
        file: "cinemateque_francaise_12.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 13",
        file: "cinemateque_francaise_13.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 14",
        file: "cinemateque_francaise_14.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 15",
        file: "cinemateque_francaise_15.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 16",
        file: "cinemateque_francaise_16.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 17",
        file: "cinemateque_francaise_17.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 18",
        file: "cinemateque_francaise_18.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 19",
        file: "cinemateque_francaise_19.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 20",
        file: "cinemateque_francaise_20.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 21",
        file: "cinemateque_francaise_21.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 22",
        file: "cinemateque_francaise_22.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 23",
        file: "cinemateque_francaise_23.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 24",
        file: "cinemateque_francaise_24.png",
        repo: "new"
      },
      {
        name: "Cinémathèque 25",
        file: "cinemateque_francaise_25.png",
        repo: "new"
      }
    ];
    $$renderer2.push(`<div class="selector svelte-ai08gq"><label for="samples" class="svelte-ai08gq">Sample Images:</label> <select id="samples" class="svelte-ai08gq">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`-- Choose a sample --`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(samples);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sample = each_array[$$index];
      $$renderer2.option({ value: sample.file }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(sample.name)}`);
      });
    }
    $$renderer2.push(`<!--]--></select></div>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<div class="container svelte-1uha8ag"><h1 class="svelte-1uha8ag">Phenakistoscope Lab</h1> <p class="sub svelte-1uha8ag">Convert old phenakistoscope discs into animated GIFs</p> `);
  FileUploader($$renderer);
  $$renderer.push(`<!----> `);
  SampleImageSelector($$renderer);
  $$renderer.push(`<!----> `);
  ImagePreview($$renderer);
  $$renderer.push(`<!----> `);
  CanvasPlayer($$renderer);
  $$renderer.push(`<!----> `);
  AnalyzerPanel($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _page as default
};
