<script>
	import { onMount } from 'svelte';
	import {
		isPlaying,
		rotationSpeed,
		rotationDirection,
		imageUrl,
		detectedCircle,
		detectedCount,
		suggestedRotationSpeed,
		overlayVisible,
		playerCanvas,
		detectionAnimation,
		editMode,
		confirmedDetection,
		canvasTransform,
		isMobile,
		flickerEnabled,
		flickerFrequency,
		gifFrameCount,
		userAdjustedSpeed,
		sliceRotationAngle,
		fillOuterCircle,
		outerCircleFillColor
	} from '../store';
	// also import detectedPositions which is set by runDetection
	import { detectedPositions } from '../store';
	import { get } from 'svelte/store';

	import { countObjectsOnCircle } from '../image/countOnCircle';
	import { detectCircle as detectCircleCV } from '../image/detectCircle';
	import { sliceDisk } from '../image/sliceDisk';
	import { exportGif } from '../image/gifExport';

	let busy = false;
	
	// Track user interactions for enabling GIF save
	let hasPlayed = false;

	// Watch for play state to track if user has played
	$: if ($isPlaying) {
		hasPlayed = true;
	}

	// Determine if GIF save should be enabled
	// Active when: circle detected, playing, and speed > 0
	$: canSaveGif = !!$detectedCircle && $isPlaying && $rotationSpeed > 0;

	async function togglePlay() {
		isPlaying.update((v) => !v);
	}

	// Long press support for speed buttons
	let speedInterval = null;

	function startSpeedChange(direction) {
		// Immediate first change
		if (direction === 'increase') {
			increaseSpeed();
		} else {
			decreaseSpeed();
		}
		
		// Clear any existing interval
		if (speedInterval) {
			clearInterval(speedInterval);
		}
		
		// Continue changing while held
		speedInterval = setInterval(() => {
			if (direction === 'increase') {
				increaseSpeed();
			} else {
				decreaseSpeed();
			}
		}, 100); // Repeat every 100ms
	}

	function stopSpeedChange() {
		if (speedInterval) {
			clearInterval(speedInterval);
			speedInterval = null;
		}
	}

	function increaseSpeed() {
		rotationSpeed.update((v) => Math.min(10000, v + 60));
		userAdjustedSpeed.set(true);
	}

	function decreaseSpeed() {
		rotationSpeed.update((v) => Math.max(10, v - 60));
		userAdjustedSpeed.set(true);
	}

	function reverseDir() {
		rotationDirection.update((v) => v * -1);
	}

	async function runDetection() {
		const url = $imageUrl;
		if (!url) return;

		// Enter edit mode with continuous radar animation
		const animStartTime = Date.now();
		detectionAnimation.set({
			active: true,
			progress: 0,
			startTime: animStartTime
		});
		
		// Set edit mode after animation is initialized to ensure proper rendering
		editMode.set(true);
	}

	async function confirmDetection() {
		const url = $imageUrl;
		if (!url) return;
		busy = true;
		
		// Capture the current transform state from edit mode
		const transform = $canvasTransform;
		editMode.set(false);

		// Keep animation running for actual detection
		const animStartTime = Date.now();
		detectionAnimation.set({
			active: true,
			progress: 0,
			startTime: animStartTime
		});

		// Force canvas to start rendering the animation immediately
		if (!$isPlaying) {
			// Trigger a single frame render to show the animation start
			requestAnimationFrame(() => {});
		}

		try {
			const img = await loadImage(url);

			// Calculate rotation center from edit mode positioning
			// The crosshair was at canvas center, we need to find which image pixel was under it
			let circle = null;
			
			// Get canvas dimensions from playerCanvas
			const canvas = $playerCanvas;
			if (canvas) {
				const cw = canvas.clientWidth;
				const ch = canvas.clientHeight;
				
				// Calculate "contain" sizing (same logic as in CanvasPlayer)
				const imageRatio = img.width / img.height;
				const canvasRatio = cw / ch;
				let dw, dh;
				if (imageRatio > canvasRatio) {
					dw = cw;
					dh = cw / imageRatio;
				} else {
					dh = ch;
					dw = ch * imageRatio;
				}
				
				// The crosshair is at canvas center (cw/2, ch/2)
				// The image transform origin is at (cw/2 + translateX, ch/2 + translateY)
				// So the crosshair is at (-translateX, -translateY) in the transformed coordinate system
				const crosshairX = -transform.translateX;
				const crosshairY = -transform.translateY;
				
				// Convert from zoomed drawn space to unzoomed drawn space
				const unzoomedX = crosshairX / transform.scale;
				const unzoomedY = crosshairY / transform.scale;
				
				// Convert from drawn space (centered at 0,0 with size dw×dh) to image pixels
				const scaleToImage = img.width / dw;
				const imageX = unzoomedX * scaleToImage + img.width / 2;
				const imageY = unzoomedY * scaleToImage + img.height / 2;
				
				circle = {
					x: imageX,
					y: imageY,
					r: (Math.min(img.width, img.height) / 2) * 0.9
				};
			}
			
			if (!circle) {
				// fallback: assume center and radius
				circle = {
					x: img.width / 2,
					y: img.height / 2,
					r: (Math.min(img.width, img.height) / 2) * 0.9
				};
			}

			const res = await countObjectsOnCircle(img, circle, { samples: 720 });

			// Wait for animation to complete (2 seconds total)
			const elapsed = Date.now() - animStartTime;
			const delayMs = 2000 - elapsed;
			if (delayMs > 0) {
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}

			detectedCircle.set(circle);
			detectedCount.set(res.count);
			detectedPositions.set(res.positions || []);
			// suggested rotation speed: degrees per second that advances roughly one
			// object per frame at a target framerate. Use 30 FPS as a reasonable default.
			const TARGET_FPS = 30;
			const suggestedDegPerFrame = res.count > 0 ? 360 / res.count : 1;
			const suggestedDegPerSec = suggestedDegPerFrame * TARGET_FPS;
			suggestedRotationSpeed.set(suggestedDegPerSec);

			// Animation complete - stop radar but show crosshair
			detectionAnimation.set({
				active: false,
				progress: 1,
				startTime: animStartTime
			});
			
			// Show confirmed crosshair (will stay until play is pressed)
			confirmedDetection.set(true);
			
			// Stop playing so user sees "Play" button highlighted
			isPlaying.set(false);
		} finally {
			busy = false;
		}
	}

	function applySuggestedSpeed() {
		suggestedRotationSpeed.subscribe((s) => {
			if (s) {
				rotationSpeed.set(s);
				userAdjustedSpeed.set(true);
			}
		})();
	}

	function cancelEditMode() {
		editMode.set(false);
		confirmedDetection.set(false);
		detectionAnimation.set({
			active: false,
			progress: 0,
			startTime: 0
		});
	}

	// allow user to type a manual speed (degrees/sec)
	let manualSpeed = 0;
	// initialize manualSpeed when rotationSpeed store changes
	$: manualSpeed = Number($rotationSpeed || 0);

	function applyManualSpeed() {
		const v = Number(manualSpeed) || 0;
		if (v < 0) return; // Allow 0 and positive values
		rotationSpeed.set(v);
		userAdjustedSpeed.set(true);
	}

	// GIF export
	let exporting = false;
	let gifFps = 15; // Slower FPS for smoother, more natural looking animation like Prof Stampfer
	
	async function saveGif() {
		const url = $imageUrl || get(imageUrl);
		if (!url) return alert('No image loaded to export.');
		if (!_detectedCircle) return alert('Please detect the circle before exporting the GIF.');
		const img = await loadImage(url);

		// draw the original image at its native resolution to an offscreen canvas
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, img.width, img.height);
		exporting = true;
		try {
			// Use detected count for frame count (minimum 12, double the count for smoother animation)
			// If user has manually set a count, use that instead
			let count;
			if (optsGifCount && optsGifCount !== _detectedCount * 2) {
				// User has manually set frame count
				count = optsGifCount;
			} else if (_detectedCount && _detectedCount > 0) {
				// Use detected count * 2 for smoother animation
				count = Math.max(12, _detectedCount * 2);
			} else {
				// Fallback to manual count or default
				count = optsGifCount || 24;
			}

			// build circle info from detection (required)
			const circle = _detectedCircle;

			// Let sliceDisk calculate outputSize automatically based on the detected circle
			// Don't force a specific outputSize to avoid cropping
			
			// slice frames rotating around the detected circle center using the chosen speed
			const rotationSpeedValue = Number(get(rotationSpeed) || 0); // deg/sec
			const directionValue = Number(get(rotationDirection) || 1);
			
			// For GIF export, we want a complete 360° rotation divided by frame count
			// This ensures smooth looping regardless of playback speed
			const degreesPerFrame = 360 / count;
			
			// Get the user-defined slice rotation angle for proper alignment
			const userRotationAngle = get(sliceRotationAngle) || 0; // in radians
			
			// Get fill outer circle options
			const shouldFillOuter = get(fillOuterCircle);
			const fillColor = get(outerCircleFillColor);
			
			const frames = sliceDisk(canvas, count, {
				circle,
				// Don't pass outputSize - let sliceDisk calculate it from circle + margin
				margin: 1.1, // Small margin - detected circle is already the correct outer edge
				zoom: 1,
				fps: gifFps,
				rotationSpeed: degreesPerFrame * gifFps, // Convert to deg/sec for sliceDisk
				direction: directionValue,
				initialRotation: userRotationAngle, // Apply user's rotation adjustment
				fillOuterCircle: shouldFillOuter,
				fillColor: fillColor
			});

			// Export with selected FPS for smooth animation
			const urlGif = await exportGif(frames, gifFps);
			const a = document.createElement('a');
			a.href = urlGif;
			// Nom de fichier avec timestamp et source
			const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
			a.download = `phenaki-lab_${timestamp}_${frames.length}frames_${gifFps}fps.gif`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} catch (e) {
			console.error('GIF export failed', e);
			alert('GIF export failed: ' + (e && e.message));
		} finally {
			exporting = false;
		}
	}

	// Frame count is now managed by the gifFrameCount store for real-time visualization
	// Sync local reactive variable with store
	$: optsGifCount = $gifFrameCount;

	// draggable overlay position (persist in localStorage)
	const POS_KEY = 'phenaki.speedControlPos';
	let overlayPos = { left: null, top: null };
	let dragMode = false; // only drag when double-tapped or dragging the handle
	let dragging = false;
	let dragStart = { x: 0, y: 0 };
	let startPos = { left: 0, top: 0 };
	let lastTapTime = 0;

	function loadOverlayPos() {
		try {
			const raw = localStorage.getItem(POS_KEY);
			if (raw) overlayPos = JSON.parse(raw);
		} catch (e) {
			/* ignore */
		}
	}

	function saveOverlayPos() {
		try {
			localStorage.setItem(POS_KEY, JSON.stringify(overlayPos));
		} catch (e) {}
	}

	function onOverlayPointerDown(e) {
		// detect double-tap on the overlay body (not buttons or handle)
		const now = Date.now();
		const isDoubleTap = now - lastTapTime < 300;
		lastTapTime = now;

		// don't start drag when clicking a button
		if (e.target && e.target.closest && e.target.closest('button')) return;

		// only drag if double-tapped, dragging the handle, or on mobile always allow drag from handle or non-button areas
		const isDraggingHandle = e.target && e.target.closest && e.target.closest('.drag-handle');
		const isMobileDevice = $isMobile;
		const isClickingSpeedDisplay = e.target && e.target.closest && 
			(e.target.classList.contains('speed-display') || e.target.closest('.speed-display'));
		
		// On mobile: allow drag from handle or speed display area. On desktop: require double-tap or handle
		if (!isDraggingHandle && !isDoubleTap && !isMobileDevice && !isClickingSpeedDisplay) return;
		if (isMobileDevice && !isDraggingHandle && !isClickingSpeedDisplay) return;

		dragMode = true;
		dragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		startPos = {
			left: overlayPos.left ?? Math.round((window.innerWidth - 200) / 2),
			top: overlayPos.top ?? Math.round((window.innerHeight - 80) / 2)
		};
		try {
			e.target.setPointerCapture(e.pointerId);
		} catch (err) {}
		window.addEventListener('pointermove', onOverlayPointerMove);
		window.addEventListener('pointerup', onOverlayPointerUp);
	}

	function onOverlayPointerMove(e) {
		if (!dragging) return;
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;
		overlayPos.left = Math.round(startPos.left + dx);
		overlayPos.top = Math.round(startPos.top + dy);
	}

	function onOverlayPointerUp(e) {
		dragging = false;
		dragMode = false;
		try {
			e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId);
		} catch (err) {}
		window.removeEventListener('pointermove', onOverlayPointerMove);
		window.removeEventListener('pointerup', onOverlayPointerUp);
		saveOverlayPos();
	}

	// initialize overlay position on mount and clamp to viewport on resize
	onMount(() => {
		loadOverlayPos();
		// ensure default position is centered on screen
		if (overlayPos.left == null) overlayPos.left = Math.round((window.innerWidth - 200) / 2);
		if (overlayPos.top == null) overlayPos.top = Math.round((window.innerHeight - 80) / 2);

		// clamp overlay to remain inside viewport
		function clampOverlay() {
			const elW = 200;
			const elH = 80;
			const minLeft = 8;
			const minTop = 8;
			const maxLeft = Math.max(minLeft, window.innerWidth - elW - 8);
			const maxTop = Math.max(minTop, window.innerHeight - elH - 8);
			if (overlayPos.left == null) overlayPos.left = maxLeft;
			if (overlayPos.top == null) overlayPos.top = maxTop;
			overlayPos.left = Math.min(Math.max(overlayPos.left, minLeft), maxLeft);
			overlayPos.top = Math.min(Math.max(overlayPos.top, minTop), maxTop);
		}

		// clamp now, and when window resizes
		clampOverlay();
		const onResize = () => {
			clampOverlay();
			saveOverlayPos();
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	function loadImage(url) {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = 'anonymous';
			img.onload = () => resolve(img);
			img.onerror = reject;
			img.src = url;
		});
	}

	// small helper to read current store values in template
	$: _detectedCircle = $detectedCircle;
	$: _detectedCount = $detectedCount;
	$: _suggested = $suggestedRotationSpeed;
	$: _overlay = $overlayVisible;
</script>

<div class="panel">
	{#if exporting}
		<div class="export-overlay" role="status" aria-live="polite">
			<div class="export-box">
				<div class="spinner" aria-hidden="true"></div>
				<div class="export-text">Working… Exporting GIF — please wait</div>
			</div>
		</div>
	{/if}
	<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
		<button 
			class={_detectedCircle && !$isPlaying ? 'play-highlight' : ''}
			class:pause-subtle={$isPlaying && !_detectedCircle}
			on:click={togglePlay}
			disabled={!$imageUrl}
			>{$isPlaying ? 'Pause' : 'Play'}</button
		>
		<button on:click={reverseDir}>Reverse</button>
		{#if $editMode}
			<button class="confirm-btn" on:click={confirmDetection} disabled={busy}
				>Confirm Detection</button
			>
			<button on:click={cancelEditMode}>Cancel</button>
		{:else}
			<button
				class={!_detectedCircle ? 'detect-btn-required' : ''}
				on:click={runDetection}
				disabled={busy || !$imageUrl || $isPlaying}>Detect Circle & Count</button
			>
		{/if}
		<button on:click={applySuggestedSpeed} disabled={!_suggested}>Apply Suggested Speed</button>
		
		<!-- GIF Export Group -->
		<div class="gif-export-group">
			<button class="save-gif-btn" on:click={saveGif} disabled={!canSaveGif || exporting}
				>{exporting ? '⏳ Exporting...' : '💾 Save GIF'}</button
			>
			<label style="display:flex;align-items:center;gap:6px;">
				<span style="font-size:12px;opacity:0.8;">Frames:</span>
				<input
					type="number"
					min="6"
					step="1"
					placeholder={_detectedCount ? `Auto (${_detectedCount * 2})` : 'Auto (24)'}
					value={$gifFrameCount}
					on:input={(e) => gifFrameCount.set(e.target.value ? Number(e.target.value) : null)}
					style="width:80px;padding:4px;border-radius:4px;border:1px solid #ccc;"
				/>
				<span style="font-size:11px;opacity:0.6;" title="Leave empty for auto-detection">
					{#if optsGifCount}
						Manual
					{:else if _detectedCount}
						Auto (x2)
					{:else}
						Auto
					{/if}
				</span>
			</label>
			<label style="display:flex;align-items:center;gap:6px;">
				<span style="font-size:12px;opacity:0.8;">FPS:</span>
				<select
					bind:value={gifFps}
					style="padding:4px;border-radius:4px;border:1px solid #ccc;background:#333;color:white;"
				>
					<option value={3}>3 (Ultra Slow)</option>
					<option value={5}>5 (Very Slow)</option>
					<option value={8}>8 (Slow)</option>
					<option value={10}>10 (Classic)</option>
					<option value={15}>15 (Natural)</option>
					<option value={20}>20 (Smooth)</option>
					<option value={24}>24 (Cinema)</option>
					<option value={30}>30 (Fast)</option>
				</select>
			</label>
		</div>
		
		<label style="display:flex;align-items:center;gap:6px;margin-left:6px;">
			<input
				type="checkbox"
				checked={_overlay}
				on:change={(e) => overlayVisible.set(e.target.checked)}
			/>
			<span>Show Overlay</span>
		</label>
		<label style="display:flex;align-items:center;gap:6px;margin-left:6px;">
			<input
				type="checkbox"
				bind:checked={$flickerEnabled}
			/>
			<span>Flicker Effect</span>
			{#if $flickerEnabled}
				<span style="background: #4a9eff; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.75em; font-weight: bold; margin-left: 4px;">
					{$flickerFrequency} Hz
				</span>
			{/if}
		</label>
		<label style="display:flex;align-items:center;gap:6px;margin-left:6px;">
			<input
				type="checkbox"
				bind:checked={$fillOuterCircle}
			/>
			<span>Fill Outer Circle</span>
			{#if $fillOuterCircle}
				<input
					type="color"
					bind:value={$outerCircleFillColor}
					style="width:40px;height:28px;border:1px solid #555;border-radius:4px;cursor:pointer;margin-left:4px;"
					title="Choose fill color"
				/>
			{/if}
		</label>
	</div>

	<!-- Flicker Fusion Threshold Controls -->
	{#if $flickerEnabled}
		<div style="margin-top: 16px; padding: 12px; background: rgba(74, 158, 255, 0.08); border-radius: 6px; border: 1px solid rgba(74, 158, 255, 0.2);">
			<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
				<div style="font-weight: 600; color: #4a9eff; font-size: 0.95em;">⚡ Flicker Fusion Threshold</div>
				<a 
					href="https://en.wikipedia.org/wiki/Flicker_fusion_threshold" 
					target="_blank" 
					rel="noopener noreferrer"
					style="display: flex; align-items: center; gap: 4px; font-size: 0.75em; color: #aaa; text-decoration: none; opacity: 0.7; transition: opacity 0.2s;"
					title="Learn more on Wikipedia"
				>
					<svg width="14" height="14" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
						<path fill="currentColor" d="M120 0C53.8 0 0 53.8 0 120s53.8 120 120 120 120-53.8 120-120S186.2 0 120 0zm0 217.5c-53.8 0-97.5-43.7-97.5-97.5S66.2 22.5 120 22.5s97.5 43.7 97.5 97.5-43.7 97.5-97.5 97.5zm-7.5-165h15v90h-15zm0 105h15v15h-15z"/>
					</svg>
					<span>Wikipedia</span>
				</a>
			</div>
			
			<div style="font-size: 0.8em; color: #888; font-style: italic; margin-bottom: 10px;">
				Note: This test only affects visualization, not the exported GIF
			</div>
			
			<!-- Quick Presets -->
			<div style="margin-bottom: 12px;">
				<div style="font-size: 0.85em; color: #aaa; margin-bottom: 6px;">Quick Presets:</div>
				<div style="display: flex; gap: 6px; flex-wrap: wrap;">
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(30)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 30 ? '#c92a2a' : '#555'}; background: {$flickerFrequency === 30 ? '#c92a2a' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						30 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(42)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 42 ? '#ff6b6b' : '#555'}; background: {$flickerFrequency === 42 ? '#ff6b6b' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						42 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(50)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 50 ? '#ffa500' : '#555'}; background: {$flickerFrequency === 50 ? '#ffa500' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						50 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(55)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 55 ? '#4a9eff' : '#555'}; background: {$flickerFrequency === 55 ? '#4a9eff' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						55 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(60)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 60 ? '#51cf66' : '#555'}; background: {$flickerFrequency === 60 ? '#51cf66' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						60 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(70)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 70 ? '#845ef7' : '#555'}; background: {$flickerFrequency === 70 ? '#845ef7' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						70 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(80)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 80 ? '#20c997' : '#555'}; background: {$flickerFrequency === 80 ? '#20c997' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						80 Hz
					</button>
					<button 
						class="flicker-preset-btn"
						on:click={() => flickerFrequency.set(100)}
						style="padding: 8px 14px; border: 1px solid {$flickerFrequency === 100 ? '#12b886' : '#555'}; background: {$flickerFrequency === 100 ? '#12b886' : '#333'}; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9em; min-height: 40px;">
						100 Hz
					</button>
				</div>
			</div>

			<!-- Fine Control Slider -->
			<div style="margin-top: 12px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
					<span style="font-size: 0.85em; color: #ccc;">Fine Tune:</span>
					<span style="font-size: 1.1em; font-weight: bold; color: #4a9eff;">{$flickerFrequency} Hz</span>
				</div>
				<input 
					type="range" 
					min="20" 
					max="100" 
					step="0.5" 
					value={$flickerFrequency}
					on:input={(e)=>flickerFrequency.set(+e.target.value)}
					style="width: 100%; cursor: pointer;" />
				<div style="display: flex; justify-content: space-between; font-size: 0.7em; color: #666; margin-top: 4px;">
					<span>20 Hz</span>
					<span style="color: #4a9eff; font-weight: 500;">
						{#if $flickerFrequency < 40}
							🔴 Flicker
						{:else if $flickerFrequency < 60}
							🟡 Fusion
						{:else}
							🟢 Smooth
						{/if}
					</span>
					<span>100 Hz</span>
				</div>
			</div>

			<!-- Visual Guide -->
			<div style="margin-top: 10px; padding: 8px; background: rgba(74, 158, 255, 0.12); border-radius: 4px; font-size: 0.8em;">
				<div style="font-weight: 500; color: #4a9eff; margin-bottom: 3px;">
					{#if $flickerFrequency < 48}
						⚡ Strong Flicker
					{:else if $flickerFrequency < 52}
						🎯 Critical Threshold
					{:else if $flickerFrequency < 58}
						✨ Near-Fusion
					{:else if $flickerFrequency < 62}
						🎬 Cinema (60 Hz)
					{:else}
						🌟 Ultra Smooth
					{/if}
				</div>
				<div style="color: #aaa; font-size: 0.9em;">
					{#if $flickerFrequency < 48}
						Noticeable flicker - classic phenakistoscope effect
					{:else if $flickerFrequency < 52}
						Flicker begins to fuse - critical threshold
					{:else if $flickerFrequency < 58}
						Subtle pulsing - artistic sweet spot
					{:else if $flickerFrequency < 62}
						Standard cinema/TV rate - minimal flicker
					{:else}
						Above fusion threshold - very smooth
					{/if}
				</div>
			</div>
		</div>
	{/if}

	{#if $detectedCircle}
		<div
			class="speed-control {dragMode ? 'dragMode' : ''} {dragging ? 'dragging' : ''} {$isMobile ? 'mobile' : ''}"
			on:pointerdown={onOverlayPointerDown}
			style="left: {overlayPos.left ?? Math.round((window.innerWidth - 200) / 2)}px; top: {overlayPos.top ?? Math.round((window.innerHeight - 80) / 2)}px;"
		>
			{#if dragMode || $isMobile}
				<div class="drag-handle" title="Drag to move">⋮⋮</div>
			{/if}
			<div style="display:flex;gap:12px;align-items:center;">
				<button 
					class="speed-btn" 
					on:pointerdown|preventDefault|stopPropagation={() => startSpeedChange('decrease')}
					on:pointerup|preventDefault|stopPropagation={stopSpeedChange}
					on:pointerleave|stopPropagation={stopSpeedChange}
					on:pointercancel|stopPropagation={stopSpeedChange}
					on:touchstart|preventDefault|stopPropagation
					on:touchend|preventDefault|stopPropagation
				>−</button>
				<div style="text-align:center;min-width:120px;">
					<div class="speed-display">{$rotationSpeed.toFixed(0)}°/s</div>
					<div style="font-size:11px;opacity:0.6;margin-top:4px;">Rotation Speed</div>
				</div>
				<button 
					class="speed-btn" 
					on:pointerdown|preventDefault|stopPropagation={() => startSpeedChange('increase')}
					on:pointerup|preventDefault|stopPropagation={stopSpeedChange}
					on:pointerleave|stopPropagation={stopSpeedChange}
					on:pointercancel|stopPropagation={stopSpeedChange}
					on:touchstart|preventDefault|stopPropagation
					on:touchend|preventDefault|stopPropagation
				>+</button>
			</div>
		</div>
	{/if}

	<div style="margin-top:12px;">
		<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
			<div>
				<strong>Current Speed:</strong>
				{$rotationSpeed.toFixed(0)}°/s |
				{#if $isMobile}
					<em style="font-size:12px;opacity:0.7;">(Use +/− buttons above to adjust speed)</em>
				{:else}
					<em style="font-size:12px;opacity:0.7;">(Touch: drag up to speed up, down to slow down)</em>
				{/if}
			</div>
			<div style="display:flex;gap:6px;align-items:center;">
				<label for="manual-speed-input" style="font-size:12px;">Type speed:</label>
				<input
					id="manual-speed-input"
					type="number"
					min="1"
					step="1"
					bind:value={manualSpeed}
					style="width:100px;padding:6px;border-radius:4px;border:1px solid #ccc;"
				/>
				<button on:click={applyManualSpeed}>Set</button>
			</div>
		</div>
		<div><strong>Selected scenes count:</strong> {$gifFrameCount ?? 12}</div>
		<div><strong>Suggested speed:</strong> {_suggested ? _suggested.toFixed(0) : '—'}°/s</div>
		{#if _detectedCircle}
			<div>
				<strong>Circle:</strong> x={Math.round(_detectedCircle.x)}, y={Math.round(
					_detectedCircle.y
				)}, r={Math.round(_detectedCircle.r)}
			</div>
		{/if}
	</div>
</div>

<style>
	.panel {
		margin-top: 10px;
	}
	button {
		padding: 6px 10px;
		border: none;
		background: #444;
		color: #fff;
		border-radius: 4px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}

	/* Thumb-friendly speed control buttons (fixed overlay so it remains visible while zooming) */
	.speed-control {
		position: fixed;
		/* left/top will be set inline from overlayPos when available */
		padding: 12px;
		background: rgba(34, 34, 34, 0.95);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		user-select: none;
		cursor: auto;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	/* Mobile optimizations */
	@media (max-width: 768px) {
		.speed-control {
			/* On mobile, keep it centered and movable */
			max-width: calc(100vw - 20px);
			padding: 16px;
		}

		/* Always show drag handle on mobile */
		.speed-control.mobile .drag-handle {
			display: block;
			width: 50px;
			height: 6px;
			background: #666;
			border-radius: 3px;
			margin-bottom: 12px;
			cursor: grab;
			font-size: 12px;
			text-align: center;
			line-height: 6px;
			color: #999;
			letter-spacing: 2px;
		}

		/* Larger buttons on mobile for easier touch */
		.speed-control .speed-btn {
			width: 70px;
			height: 70px;
			font-size: 32px;
			min-height: unset;
		}

		/* Make buttons finger-friendly on mobile */
		button {
			min-height: 48px;
			padding: 12px 18px;
			font-size: 16px;
		}

		/* Flicker preset buttons larger on mobile */
		.flicker-preset-btn {
			min-height: 48px !important;
			padding: 12px 18px !important;
			font-size: 1em !important;
		}

		.gif-export-group {
			gap: 12px;
		}

		.gif-export-group button {
			min-height: 48px;
			padding: 12px 20px;
			font-size: 16px;
		}

		.gif-export-group input,
		.gif-export-group select {
			min-height: 48px;
			padding: 12px;
			font-size: 16px;
		}

		/* Labels and text more readable on mobile */
		label {
			font-size: 14px;
		}

		/* Manual speed input easier to tap */
		#manual-speed-input {
			min-height: 48px;
			padding: 12px;
			font-size: 16px;
		}
	}
	.speed-control.dragMode {
		cursor: grab;
	}
	.speed-control.dragMode .drag-handle {
		cursor: grab;
		display: block;
	}
	.speed-control.dragMode.dragging {
		cursor: grabbing;
	}
	.speed-control.dragMode.dragging .drag-handle {
		cursor: grabbing;
	}

	.drag-handle {
		display: none;
		width: 40px;
		height: 5px;
		background: linear-gradient(to right, transparent, #666, transparent);
		border-radius: 3px;
		margin-bottom: 8px;
		cursor: grab;
	}

	.speed-btn {
		width: 60px;
		height: 60px;
		font-size: 28px;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #0066cc;
		border-radius: 8px;
		cursor: pointer;
		font-weight: bold;
		transition: background 0.2s;
	}

	.speed-btn:hover {
		background: #0052a3;
	}

	.speed-btn:active {
		background: #003d7a;
		transform: scale(0.95);
	}

	.speed-display {
		font-size: 28px;
		font-weight: bold;
		color: #0066cc;
	}

	/* Red highlight for required detection step */
	.detect-btn-required {
		background: #cc0000 !important;
		animation: pulse-red 1s infinite;
	}

	.detect-btn-required:hover {
		background: #990000 !important;
	}

	.detect-btn-required:active {
		background: #660000 !important;
	}

	@keyframes pulse-red {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.7);
		}
		50% {
			box-shadow: 0 0 0 6px rgba(204, 0, 0, 0.3);
		}
	}

	.play-highlight {
		background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%) !important;
		border: 2px solid #ff6666 !important;
		animation: glow 2s infinite;
		font-weight: bold;
		box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
	}

	@keyframes glow {
		0%,
		100% {
			box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
		}
		50% {
			box-shadow: 0 0 20px rgba(255, 68, 68, 0.8);
		}
	}

	.pause-subtle {
		opacity: 0.6;
		font-weight: normal;
	}

	.gif-export-group {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
		padding: 8px 12px;
		border: 2px solid #4a90e2;
		border-radius: 8px;
		background: rgba(74, 144, 226, 0.15);
	}

	.confirm-btn {
		background: linear-gradient(135deg, #44ff44 0%, #00cc00 100%) !important;
		border: 2px solid #66ff66 !important;
		animation: pulse-green 2s infinite;
		font-weight: bold;
		box-shadow: 0 0 10px rgba(68, 255, 68, 0.5);
	}

	@keyframes pulse-green {
		0%,
		100% {
			box-shadow: 0 0 10px rgba(68, 255, 68, 0.5);
		}
		50% {
			box-shadow: 0 0 20px rgba(68, 255, 68, 0.8);
		}
	}

	/* Save GIF button - attractive and prominent */
	.save-gif-btn {
		background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%) !important;
		border: 2px solid #00d4ff !important;
		animation: pulse-save 2s infinite;
		font-weight: bold;
		font-size: 1.1em;
		box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
	}

	.save-gif-btn:hover:not(:disabled) {
		background: linear-gradient(135deg, #00e5ff 0%, #00aaff 100%) !important;
		transform: translateY(-2px);
		box-shadow: 0 4px 20px rgba(0, 212, 255, 0.8);
	}

	.save-gif-btn:active:not(:disabled) {
		transform: translateY(0px);
	}

	.save-gif-btn:disabled {
		background: #555 !important;
		border-color: #666 !important;
		animation: none;
		box-shadow: none;
		opacity: 0.5;
	}

	@keyframes pulse-save {
		0%,
		100% {
			box-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
		}
		50% {
			box-shadow: 0 0 25px rgba(0, 212, 255, 0.9), 0 0 35px rgba(0, 212, 255, 0.5);
		}
	}

	/* Les styles pour l'export (qui étaient dans la deuxième balise) ont été fusionnés ici. */
	.export-overlay {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.45);
		z-index: 10000;
	}
	.export-box {
		background: rgba(255, 255, 255, 0.06);
		color: #fff;
		padding: 18px 22px;
		border-radius: 12px;
		display: flex;
		gap: 12px;
		align-items: center;
		backdrop-filter: blur(4px);
	}
	.export-text {
		font-size: 14px;
	}
	.spinner {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.18);
		border-top-color: #fff;
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
