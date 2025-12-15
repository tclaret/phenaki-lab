<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		imageUrl,
		isPlaying,
		rotationSpeed,
		rotationDirection,
		detectedCircle,
		detectedPositions,
		detectedCount,
		overlayVisible,
		playerCanvas,
		detectionAnimation,
		flickerEnabled,
		flickerFrequency,
		editMode,
		confirmedDetection,
		canvasTransform,
		isMobile,
		gifFrameCount
	} from '$lib/store';

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
	
	// Sync local state to store (one-way: local -> store)
	$: canvasTransform.set({ translateX, translateY, scale });
	
	// Reset pan/zoom when entering edit mode
	$: if ($editMode) {
		translateX = 0;
		translateY = 0;
		scale = 1;
		drawFrame();
	}
	
	// Clear confirmed crosshair when playing starts
	$: if ($isPlaying) {
		confirmedDetection.set(false);
	}
	// pointer tracking for pinch/pan
	const pointers = new Map();
	let pinchStartScale = 1;
	let pinchStartDist = 0;
	let lastPanX = 0;
	let lastPanY = 0;
	let raf;
	// Smoothing for mobile pinch
	let targetScale = 1;
	let smoothingRaf = null;
	let lastDrawTime = 0;
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

	// Redraw when gifFrameCount changes (to update pie slices in edit mode)
	$: if ($gifFrameCount !== undefined) {
		drawFrame();
	}

	function loadImage(url) {
		imageReady = false;
		htmlImg = new Image();
		htmlImg.crossOrigin = 'anonymous';

		htmlImg.onload = () => {
			console.log('Image loaded:', url, 'Size:', htmlImg.width, 'x', htmlImg.height);
			imageReady = true;
			resizeCanvas();
			drawFrame();
		};

		htmlImg.onerror = (e) => {
			console.error('Erreur chargement:', url, e);
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
				Math.max(150, Math.round((r.width * Math.sqrt(imgW * imgW + imgH * imgH)) / imgW))
			);
			wrapper.style.height = desiredHeight + 'px';
			// recompute rect after changing height
			const rr = wrapper.getBoundingClientRect();
			canvas.style.width = rr.width + 'px';
			canvas.style.height = rr.height + 'px';
			canvas.width = Math.round(rr.width * dpr);
			canvas.height = Math.round(rr.height * dpr);
		} else {
			canvas.style.width = r.width + 'px';
			canvas.style.height = r.height + 'px';
			canvas.width = Math.round(r.width * dpr);
			canvas.height = Math.round(r.height * dpr);
		}

		if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		drawFrame();
	}

	onMount(() => {
		// Detect mobile/tablet device based on touch capability and screen size
		const checkMobile = () => {
			// Consider it mobile/tablet if it has touch support, regardless of screen width
			// This ensures tablets in landscape mode are properly detected
			const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
			const mobile = hasTouch || window.innerWidth < 768;
			isMobile.set(mobile);
		};
		checkMobile();
		window.addEventListener('resize', checkMobile);
		
		if (canvas) {
			// expose the canvas element to other components (for GIF export)
			playerCanvas.set(canvas);
			ctx = canvas.getContext('2d');
			// prevent browser from panning the page when touching the canvas
			// On mobile, only prevent touch action when zoomed in or in edit mode
			if (wrapper) {
				const updateTouchAction = () => {
					if ($isMobile) {
						// On mobile/tablet: force touch-action to none in edit mode or when zoomed
						if (scale > 1 || $editMode) {
							wrapper.style.touchAction = 'none';
						} else {
							wrapper.style.touchAction = 'pan-y';
						}
					} else {
						// On desktop: always prevent default touch actions
						wrapper.style.touchAction = 'none';
					}
				};
				updateTouchAction();
				// Update touch action when scale or edit mode changes
				const unsubScale = canvasTransform.subscribe(updateTouchAction);
				const unsubEdit = editMode.subscribe(updateTouchAction);
			}
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
			window.removeEventListener('resize', checkMobile);
		};
	});

	// Pointer / touch handlers to change rotation speed by dragging vertically
	function onPointerDown(e) {
		if (!wrapper) return;
		
		// CRITICAL: Prevent default touch behavior when in edit mode or zoomed
		// This is essential for tablet/touch devices to allow dragging
		if ($editMode || scale > 1) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		wrapper.setPointerCapture(e.pointerId);
		// track pointer for pinch/zoom
		pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

		// Double-tap detection: check if this is a second tap within 300ms and ~50px
		const now = Date.now();
		const dx = e.clientX - lastTapX;
		const dy = e.clientY - lastTapY;
		const distance = Math.sqrt(dx * dx + dy * dy);
		if (now - lastTapTime < 300 && distance < 50 && !$editMode) {
			// Double-tap detected: toggle play/pause (disabled in edit mode)
			isPlaying.update((v) => !v);
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
			targetScale = scale;
			// store start distance for pinch
			pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
		}
	}

	function onPointerMove(e) {
		if (!wrapper) return;
		
		// CRITICAL: Prevent default touch behavior when in edit mode or zoomed
		// This is essential for tablet/touch devices to allow dragging
		if (($editMode || scale > 1) && pointers.has(e.pointerId)) {
			e.preventDefault();
			e.stopPropagation();
		}
		
		// update pointer position
		if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

		// if two pointers: pinch zoom
		if (pointers.size === 2) {
			const pts = Array.from(pointers.values());
			const a = pts[0];
			const b = pts[1];
			const dist = Math.hypot(a.x - b.x, a.y - b.y);
			const ratio = dist / pinchStartDist;
			
			// Calculer le nouveau scale avec lissage
			let newScale = Math.max(minScale, Math.min(maxScale, pinchStartScale * ratio));
			
			// Appliquer un lissage exponentiel pour un mouvement plus fluide sur mobile
			if ($isMobile) {
				const smoothFactor = 0.3; // Plus élevé = plus réactif, plus bas = plus doux
				targetScale = newScale;
				newScale = scale + (targetScale - scale) * smoothFactor;
			}

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
			
			// Throttle le redraw sur mobile pour de meilleures performances
			if ($isMobile) {
				const now = Date.now();
				if (now - lastDrawTime > 16) { // Max 60 FPS
					drawFrame();
					lastDrawTime = now;
				}
			} else {
				drawFrame();
			}
			
			showSpeedHUD = true;
			clearTimeout(hudTimeout);
			return;
		}

		// single pointer: if zoomed OR in edit mode, pan; else adjust speed vertical drag
		if (pointers.size === 1) {
			const p = pointers.values().next().value;
			if (scale > 1 || $editMode) {
				const dx = e.clientX - lastPanX;
				const dy = e.clientY - lastPanY;
				translateX += dx;
				translateY += dy;
				lastPanX = e.clientX;
				lastPanY = e.clientY;
				drawFrame();
				return;
			} else if (!$isMobile) {
				// On desktop only: vertical drag adjusts speed when not zoomed
				const dy = pointerStartY - e.clientY; // drag up => positive dy => increase speed
				const sensitivity = 8; // degrees/sec per pixel
				const delta = Math.round(dy * sensitivity);
				const newSpeed = Math.max(10, Math.min(10000, Math.round(pointerStartSpeed + delta)));
				rotationSpeed.set(newSpeed);
				showSpeedHUD = true;
				clearTimeout(hudTimeout);
			}
			// On mobile: do nothing for single finger swipe when not zoomed (allow page scroll)
		}
	}

	function onPointerUp(e) {
		if (!wrapper) return;
		try {
			wrapper.releasePointerCapture(e.pointerId);
		} catch (e) {}
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
			// Reset pinch variables
			pinchStartDist = 0;
			targetScale = scale;
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
		const isPlayingOrAnimating = $isPlaying || $detectionAnimation.active || $editMode;
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

		// rotationSpeed is degrees per second (only rotate if playing, not during detection animation or edit mode)
		if ($isPlaying && !$editMode) {
			const degPerSec = $rotationSpeed || 0;
			angle += degPerSec * ($rotationDirection || 1) * (dt / 1000);
		}
		drawFrame();
		raf = requestAnimationFrame(loop);
	}

	// React to play/pause/edit changes - ensure animation loop runs when needed
	$: {
		const shouldAnimate = $isPlaying || $detectionAnimation.active || $editMode;
		if (shouldAnimate) {
			// start the loop if not already running
			if (!raf) {
				raf = requestAnimationFrame(loop);
			}
		} else {
			// stop the loop
			if (raf) {
				cancelAnimationFrame(raf);
				raf = null;
				lastTime = 0;
			}
		}
	}

	function drawFrame() {
		if (!imageReady || !ctx || !htmlImg || !canvas) {
			console.log('DrawFrame skipped:', { imageReady, ctx: !!ctx, htmlImg: !!htmlImg, canvas: !!canvas });
			return;
		}

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
		
		// If we have a detected circle, rotate around its center instead of image center
		let rotationOffsetX = 0;
		let rotationOffsetY = 0;
		if ($detectedCircle) {
			// Calculate offset from image center to circle center in image space
			const scaleImg = dw / htmlImg.width; // Scale factor from image pixels to drawn size
			rotationOffsetX = ($detectedCircle.x - htmlImg.width / 2) * scaleImg * scale;
			rotationOffsetY = ($detectedCircle.y - htmlImg.height / 2) * scaleImg * scale;
		}
		
		ctx.translate(cw / 2 + translateX, ch / 2 + translateY);
		// Translate to the detected circle center
		ctx.translate(rotationOffsetX, rotationOffsetY);
		ctx.rotate((angle * Math.PI) / 180);
		// Translate back to draw the image centered at the rotation point
		ctx.translate(-rotationOffsetX, -rotationOffsetY);
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

				// Retro-futuristic radar animation (optimisé)
				const radarTime = Date.now() / 1000;
				const radarAngle = (radarTime * Math.PI * 0.5) % (Math.PI * 2);
				
				// Un seul anneau pulsant (optimisé)
				const pulsePhase = (radarTime * 0.8) % 2;
				const pulseRadius = cr * (0.8 + pulsePhase * 0.4);
				const pulseOpacity = Math.max(0, 0.3 * (1 - pulsePhase / 2));
				
				ctx.beginPath();
				ctx.strokeStyle = `rgba(0, 255, 255, ${pulseOpacity})`;
				ctx.lineWidth = 2;
				ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
				ctx.stroke();
				
				// Balayage radar simplifié (sans gradient coûteux)
				ctx.save();
				ctx.translate(cx, cy);
				ctx.rotate(radarAngle);
				ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)';
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(cr * 1.1, 0);
				ctx.stroke();
				ctx.restore();
				
				// Grille simplifiée (8 lignes au lieu de 12)
				ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
				ctx.lineWidth = 1;
				for (let i = 0; i < 8; i++) {
					const gridAngle = (i / 8) * Math.PI * 2;
					ctx.beginPath();
					ctx.moveTo(cx, cy);
					ctx.lineTo(cx + Math.cos(gridAngle) * cr, cy + Math.sin(gridAngle) * cr);
					ctx.stroke();
					
					// Angles tous les 90°
					if (i % 2 === 0) {
						const angleDeg = Math.round((gridAngle * 180 / Math.PI) % 360);
						const labelDist = cr * 1.12;
						const lx = cx + Math.cos(gridAngle) * labelDist;
						const ly = cy + Math.sin(gridAngle) * labelDist;
						
						ctx.font = 'bold 10px monospace';
						ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText(`${angleDeg}°`, lx, ly);
					}
				}
				
				// Calculs mathématiques simplifiés (sans animation lourde)
				const mathOpacity = 0.6;
				ctx.font = '11px monospace';
				ctx.textAlign = 'left';
				
				const eqStartX = cx + cr * 0.3;
				const eqStartY = cy - cr * 0.8;
				const lineHeight = 14;
				
				const equations = [
					`r = ${Math.round(c.r)}px`,
					`θ = ${Math.round((radarAngle * 180 / Math.PI) % 360)}°`,
					`ω = ${$rotationSpeed}°/s`,
					`n = ${$detectedCount || 0}`
				];
				
				// Fond unique pour toutes les équations
				ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
				ctx.fillRect(eqStartX - 2, eqStartY - 8, 95, equations.length * lineHeight);
				
				equations.forEach((eq, idx) => {
					const yPos = eqStartY + idx * lineHeight;
					const colors = ['rgba(0, 255, 255, ', 'rgba(255, 0, 255, ', 'rgba(255, 255, 0, '];
					ctx.fillStyle = colors[idx % 3] + mathOpacity + ')';
					ctx.fillText(eq, eqStartX, yPos);
				});
				
				// Badge simplifié
				ctx.font = 'bold 10px sans-serif';
				ctx.textAlign = 'center';
				const algoY = cy + cr + 25;
				
				ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
				ctx.fillRect(cx - 70, algoY - 8, 140, 16);
				ctx.fillStyle = 'rgba(100, 255, 200, 0.8)';
				ctx.fillText('CIRCLE DETECTION', cx, algoY);
				
				// 6 particules au lieu de 16
				for (let i = 0; i < 6; i++) {
					const particleAngle = (i / 6) * Math.PI * 2 + radarTime * 0.3;
					const px = cx + Math.cos(particleAngle) * cr;
					const py = cy + Math.sin(particleAngle) * cr;
					
					ctx.beginPath();
					ctx.arc(px, py, 2, 0, Math.PI * 2);
					ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 0, 255, 0.8)';
					ctx.fill();
				}

				// Main circle simplifié (sans gradient coûteux)
				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
				ctx.arc(cx, cy, cr, 0, Math.PI * 2);
				ctx.stroke();

				// Crosshair simplifié
				ctx.lineWidth = 2;
				const crossSize = Math.max(15, cr * 0.15);
				
				ctx.beginPath();
				ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
				ctx.moveTo(cx - crossSize, cy);
				ctx.lineTo(cx + crossSize, cy);
				ctx.moveTo(cx, cy - crossSize);
				ctx.lineTo(cx, cy + crossSize);
				ctx.stroke();

				// Positions détectées simplifiées
				if ($detectedPositions && $detectedPositions.length) {
					ctx.fillStyle = 'rgba(255, 0, 255, 0.9)';
					for (const p of $detectedPositions) {
						const ang = p.angle;
						const px = cx + Math.cos(ang) * cr;
						const py = cy + Math.sin(ang) * cr;
						ctx.beginPath();
						ctx.arc(px, py, 2.5, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			} catch (e) {
				console.warn('overlay draw failed', e);
			}
		}

		// Draw detection radar animation only in edit mode (not after confirmation)
		if ($editMode && !$confirmedDetection) {
			try {
				// In edit mode, loop the animation continuously
				let progress;
				if ($editMode) {
					// Continuous loop animation - use a fallback startTime if not set
					const startTime = $detectionAnimation.startTime || 0;
					const elapsed = startTime > 0 ? (Date.now() - startTime) : Date.now();
					progress = (elapsed % 2000) / 2000; // Loop every 2 seconds
				} else {
					// Normal one-time animation
					progress = Math.min(1, (Date.now() - $detectionAnimation.startTime) / 2000);
				}

				// Semi-transparent overlay (darker in edit mode)
				ctx.fillStyle = $editMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)';
				ctx.fillRect(-dw / 2 - 100, -dh / 2 - 100, dw + 200, dh + 200);

				// If circle is detected, show targeted animation
				if ($detectedCircle) {
					const c = $detectedCircle;
					const scaleImg = (dw * scale) / htmlImg.width;
					const cx = (c.x - htmlImg.width / 2) * scaleImg;
					const cy = (c.y - htmlImg.height / 2) * scaleImg;
					const cr = c.r * scaleImg;

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
					ctx.lineTo(cx + Math.cos(scanAngle) * scanRadius, cy + Math.sin(scanAngle) * scanRadius);
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
				} else {
					// No circle yet, show generic scanning animation
					const maxRadius = Math.max(dw, dh) / 2;

					// Expanding rings from center
					ctx.strokeStyle = `rgba(100, 200, 255, ${0.6})`;
					ctx.lineWidth = 2;
					for (let i = 0; i < 4; i++) {
						const ringRadius = (maxRadius * (progress + i * 0.25)) % 1;
						const opacity = 1 - ringRadius;
						ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.6})`;
						ctx.beginPath();
						ctx.arc(0, 0, ringRadius * maxRadius, 0, Math.PI * 2);
						ctx.stroke();
					}

					// Rotating scan line
					ctx.strokeStyle = `rgba(100, 200, 255, 0.8)`;
					ctx.lineWidth = 3;
					const scanAngle = progress * Math.PI * 4;
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(Math.cos(scanAngle) * maxRadius, Math.sin(scanAngle) * maxRadius);
					ctx.stroke();

					// Center text
					ctx.fillStyle = `rgba(100, 200, 255, ${0.8 + 0.2 * Math.sin(progress * Math.PI * 4)})`;
					ctx.font = 'bold 18px sans-serif';
					ctx.textAlign = 'center';

					if ($editMode) {
						// Main title
						ctx.fillText('⚙️ EDIT MODE - ADJUST POSITION & ZOOM', 0, -60);

						ctx.font = 'bold 16px sans-serif';
						ctx.fillStyle = 'rgba(255, 200, 100, 0.95)';
						ctx.fillText('🎯 Align crosshair with rotation center', 0, -20);

						// Instructions
						ctx.font = '14px sans-serif';
						ctx.fillStyle = 'rgba(200, 255, 200, 0.9)';
						ctx.fillText('👆 Drag to move  •  🔍 Scroll/Pinch to zoom', 0, 20);

						// Hint at bottom
						ctx.font = 'bold 14px sans-serif';
						ctx.fillStyle = 'rgba(100, 255, 100, 0.9)';
						ctx.fillText('Click "Confirm Detection" when ready', 0, 60);
					} else {
						ctx.fillText('ANALYZING IMAGE...', 0, -20);
						// Progress indicator
						ctx.font = '12px sans-serif';
						ctx.fillText(`${Math.round(progress * 100)}%`, 0, 10);
					}
				}
			} catch (e) {
				console.warn('radar animation failed', e);
			}
		}

		// Flicker fusion threshold effect (simulates persistence of vision)
		if ($flickerEnabled && $isPlaying) {
			const flickerPeriod = 1000 / $flickerFrequency; // ms per cycle
			const phase = (lastTime % flickerPeriod) / flickerPeriod; // 0 to 1
			
			// Calculate overlay intensity based on frequency (fusion threshold simulation)
			// Below 50 Hz: strong, visible flicker
			// 50-60 Hz: moderate flicker (near fusion threshold)
			// Above 60 Hz: subtle flicker (above fusion threshold)
			const fusionFactor = Math.max(0, Math.min(1, ($flickerFrequency - 40) / 30)); // 0 at 40Hz, 1 at 70Hz
			
			// Create flicker with varying sharpness
			let flickerIntensity;
			if (fusionFactor < 0.33) {
				// Low frequency: sharp square wave flicker
				flickerIntensity = phase > 0.5 ? 0.85 : 0;
			} else if (fusionFactor < 0.67) {
				// Medium frequency: softer transition
				const smoothPhase = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
				flickerIntensity = smoothPhase > 0.6 ? 0.6 : 0;
			} else {
				// High frequency: very subtle pulsing (near/above fusion)
				const smoothPhase = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
				flickerIntensity = smoothPhase * 0.3;
			}
			
			// Apply the overlay with a gradient effect
			if (flickerIntensity > 0.05) {
				// Create a subtle vignette effect for the overlay
				const gradient = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, Math.max(cw, ch) * 0.8);
				gradient.addColorStop(0, `rgba(0, 0, 0, ${flickerIntensity * 0.7})`);
				gradient.addColorStop(0.5, `rgba(0, 0, 0, ${flickerIntensity})`);
				gradient.addColorStop(1, `rgba(0, 0, 0, ${flickerIntensity * 0.9})`);
				ctx.fillStyle = gradient;
				ctx.fillRect(-cw, -ch, cw * 3, ch * 3);
				
				// Add a subtle color tint at lower frequencies for retro effect
				if (fusionFactor < 0.5) {
					ctx.fillStyle = `rgba(20, 20, 40, ${flickerIntensity * 0.15})`;
					ctx.fillRect(-cw, -ch, cw * 3, ch * 3);
				}
			}
			
			// Frequency indicator (small, discrete badge)
			ctx.save();
			ctx.translate(cw / 2, ch / 2);
			
			// Position in top-left corner (visible when scrolling)
			const badgeX = -cw / 2 + 15;
			const badgeY = -ch / 2 + 15;
			
			// Determine color based on frequency
			let badgeColor, label;
			if ($flickerFrequency < 50) {
				badgeColor = 'rgba(255, 100, 100, 0.9)'; // Red - strong flicker
				label = 'FLICKER';
			} else if ($flickerFrequency < 60) {
				badgeColor = 'rgba(255, 180, 50, 0.9)'; // Orange - threshold
				label = 'THRESHOLD';
			} else {
				badgeColor = 'rgba(100, 220, 100, 0.9)'; // Green - fused
				label = 'FUSED';
			}
			
			// Background badge
			ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
			ctx.beginPath();
			ctx.roundRect(badgeX, badgeY, 85, 18, 4);
			ctx.fill();
			
			// Frequency text
			ctx.font = 'bold 11px monospace';
			ctx.fillStyle = badgeColor;
			ctx.textAlign = 'left';
			ctx.textBaseline = 'middle';
			ctx.fillText(`${$flickerFrequency}Hz`, badgeX + 5, badgeY + 9);
			
			// Status label
			ctx.font = '9px sans-serif';
			ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
			ctx.fillText(label, badgeX + 42, badgeY + 9);
			
			ctx.restore();
		}

		ctx.restore();

		// Display center crosshair in edit mode OR after confirmed detection (AFTER restore, so it stays fixed)
		if ($editMode || $confirmedDetection) {
			const pulsePhase = (Date.now() % 1000) / 1000; // 0 to 1 every second
			const pulseAlpha = 0.7 + 0.3 * Math.sin(pulsePhase * Math.PI * 2);

			// Draw in canvas coordinates (center of viewport)
			ctx.save();
			ctx.translate(cw / 2, ch / 2);

			// Draw "pie slices" in edit mode based on user-entered frame count
			// Use gifFrameCount if set, otherwise fall back to detectedCount, with minimum of 6
			const sliceCount = $gifFrameCount || $detectedCount || 12;
			if ($editMode && sliceCount > 0) {
				const sliceRadius = Math.min(cw, ch) * 0.3;
				const angleStep = (Math.PI * 2) / sliceCount;
				
				// Draw pie slices
				for (let i = 0; i < sliceCount; i++) {
					const startAngle = i * angleStep - Math.PI / 2; // Start from top
					const endAngle = startAngle + angleStep;
					
					// Alternating colors for each slice
					const sliceAlpha = 0.15 + 0.1 * ((i % 2) * 0.5);
					ctx.fillStyle = `rgba(100, 200, 255, ${sliceAlpha})`;
					
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.arc(0, 0, sliceRadius, startAngle, endAngle);
					ctx.closePath();
					ctx.fill();
					
					// Draw slice borders
					ctx.strokeStyle = `rgba(100, 200, 255, ${0.4 * pulseAlpha})`;
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.lineTo(
						Math.cos(startAngle) * sliceRadius,
						Math.sin(startAngle) * sliceRadius
					);
					ctx.stroke();
				}
				
				// Outer circle for the pie
				ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 * pulseAlpha})`;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(0, 0, sliceRadius, 0, Math.PI * 2);
				ctx.stroke();
			}

			ctx.strokeStyle = `rgba(255, 100, 0, ${pulseAlpha})`;
			ctx.lineWidth = 4;
			const crossSize = Math.min(cw, ch) * 0.1;

			// Outer circle (pulsing)
			ctx.beginPath();
			ctx.arc(0, 0, crossSize * 0.7, 0, Math.PI * 2);
			ctx.stroke();

			// Horizontal line
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(-crossSize, 0);
			ctx.lineTo(crossSize, 0);
			ctx.stroke();

			// Vertical line
			ctx.beginPath();
			ctx.moveTo(0, -crossSize);
			ctx.lineTo(0, crossSize);
			ctx.stroke();

			// Center circle (larger and more visible with pulse)
			ctx.beginPath();
			ctx.arc(0, 0, 10 + 3 * Math.sin(pulsePhase * Math.PI * 2), 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 100, 0, ${pulseAlpha})`;
			ctx.fill();

			// White outline for better visibility
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
			ctx.lineWidth = 2;
			ctx.stroke();

			// Small center dot
			ctx.beginPath();
			ctx.arc(0, 0, 3, 0, Math.PI * 2);
			ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
			ctx.fill();

			ctx.restore();
		}
	}
</script>

<div class="canvas-wrapper {$editMode ? 'edit-mode' : ''}" bind:this={wrapper}>
	<canvas bind:this={canvas}></canvas>
	{#if showSpeedHUD}
		<div class="speed-hud">Speed: {$rotationSpeed.toFixed(0)}°/s</div>
	{/if}
	{#if $editMode}
		<div class="edit-mode-indicator">
			⚙️ EDIT MODE - Drag to position • Scroll to zoom
		</div>
		
		<!-- Frame count adjuster overlay -->
		<div class="frame-counter">
			<button 
				class="frame-btn"
				on:click|stopPropagation={() => gifFrameCount.set(Math.max(6, ($gifFrameCount || 12) - 1))}
				on:pointerdown|stopPropagation
				on:pointermove|stopPropagation
				on:pointerup|stopPropagation
				title="Decrease frame count"
			>−</button>
			<div class="frame-display">
				<div class="frame-number">{$gifFrameCount || 12}</div>
				<div class="frame-label">frames</div>
			</div>
			<button 
				class="frame-btn"
				on:click|stopPropagation={() => gifFrameCount.set(Math.min(100, ($gifFrameCount || 12) + 1))}
				on:pointerdown|stopPropagation
				on:pointermove|stopPropagation
				on:pointerup|stopPropagation
				title="Increase frame count"
			>+</button>
		</div>
	{/if}
</div>

<style>
	.canvas-wrapper {
		width: 100%;
		height: 300px;
		position: relative;
		transition: border 0.3s ease;
	}
	
	/* Mobile: augmenter la hauteur pour mieux voir l'image */
	@media (max-width: 768px) {
		.canvas-wrapper {
			height: 90vw;
			max-height: 600px;
		}
	}
	
	.canvas-wrapper.edit-mode {
		border: 3px solid rgba(255, 100, 0, 0.8);
		border-radius: 8px;
		box-shadow: 0 0 20px rgba(255, 100, 0, 0.4);
	}
	
	canvas {
		width: 100%;
		height: 100%;
		background: #111;
		border-radius: 6px;
		cursor: move;
	}
	
	.canvas-wrapper.edit-mode canvas {
		cursor: grab;
	}
	
	.canvas-wrapper.edit-mode canvas:active {
		cursor: grabbing;
	}

	.speed-hud {
		position: absolute;
		right: 8px;
		top: 8px;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		padding: 12px 16px;
		border-radius: 6px;
		font-size: 18px;
		font-weight: 600;
		pointer-events: none;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
		max-width: calc(100% - 16px);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		z-index: 10;
	}
	
	/* Mobile responsive adjustments */
	@media (max-width: 600px) {
		.speed-hud {
			font-size: 14px;
			padding: 8px 12px;
			right: 4px;
			top: 4px;
			max-width: calc(100% - 8px);
		}
	}
	
	.edit-mode-indicator {
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(255, 100, 0, 0.95);
		color: white;
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 700;
		pointer-events: none;
		box-shadow: 0 2px 12px rgba(255, 100, 0, 0.6);
		animation: pulse 2s ease-in-out infinite;
	}
	
	.frame-counter {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 12px;
		background: rgba(20, 20, 20, 0.95);
		padding: 12px 16px;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
		border: 2px solid rgba(100, 200, 255, 0.5);
		pointer-events: auto;
		z-index: 100;
	}
	
	.frame-btn {
		width: 44px;
		height: 44px;
		background: linear-gradient(135deg, #4a9eff 0%, #357abd 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 28px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		line-height: 1;
		padding: 0;
		pointer-events: auto;
	}
	
	.frame-btn:hover {
		background: linear-gradient(135deg, #5aaeff 0%, #4a8dcd 100%);
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(74, 158, 255, 0.5);
	}
	
	.frame-btn:active {
		transform: scale(0.95);
	}
	
	.frame-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 70px;
	}
	
	.frame-number {
		font-size: 32px;
		font-weight: bold;
		color: #4a9eff;
		line-height: 1;
		margin-bottom: 2px;
	}
	
	.frame-label {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.6);
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
