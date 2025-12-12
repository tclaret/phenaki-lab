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
		editMode
	} from '../store';
	// also import detectedPositions which is set by runDetection
	import { detectedPositions } from '../store';
	import { get } from 'svelte/store';

	import { countObjectsOnCircle } from '../image/countOnCircle';
	import { detectCircle as detectCircleCV } from '../image/detectCircle';
	import { sliceDisk } from '../image/sliceDisk';
	import { exportGif } from '../image/gifExport';

	let busy = false;

	async function togglePlay() {
		isPlaying.update((v) => !v);
	}

	function increaseSpeed() {
		rotationSpeed.update((v) => Math.min(10000, v + 60));
	}

	function decreaseSpeed() {
		rotationSpeed.update((v) => Math.max(10, v - 60));
	}

	function reverseDir() {
		rotationDirection.update((v) => v * -1);
	}

	async function runDetection() {
		const url = $imageUrl;
		if (!url) return;

		// Enter edit mode with continuous radar animation
		editMode.set(true);

		// Start continuous animation for edit mode
		const animStartTime = Date.now();
		detectionAnimation.set({
			active: true,
			progress: 0,
			startTime: animStartTime
		});
	}

	async function confirmDetection() {
		const url = $imageUrl;
		if (!url) return;
		busy = true;
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

			// try OpenCV-based detect if available
			let circle = null;
			try {
				if (typeof cv !== 'undefined' && detectCircleCV) {
					// detectCircle expects an Image element
					circle = detectCircleCV(img);
				}
			} catch (e) {
				// ignore and fallback
				console.warn('cv detect failed, falling back', e);
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

			// Animation complete
			detectionAnimation.set({
				active: false,
				progress: 1,
				startTime: animStartTime
			});
		} finally {
			busy = false;
		}
	}

	function applySuggestedSpeed() {
		suggestedRotationSpeed.subscribe((s) => {
			if (s) rotationSpeed.set(s);
		})();
	}

	function cancelEditMode() {
		editMode.set(false);
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
		if (v <= 0) return;
		rotationSpeed.set(v);
	}

	// GIF export
	let exporting = false;
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
			// use the requested frame count (defaults to 24 for 1s at 24 fps)
			const count = optsGifCount || 24;

			// build circle info from detection (required)
			const circle = _detectedCircle;

			// output size: cap to a reasonable browser window size (480px max)
			const circleDiameter = circle.r * 2 * 1.1;
			const outputSize = Math.min(480, Math.round(circleDiameter));

			// slice frames rotating around the detected circle center using the chosen speed
			const rotationSpeedValue = Number(get(rotationSpeed) || 0); // deg/sec
			const directionValue = Number(get(rotationDirection) || 1);
			const frames = sliceDisk(canvas, count, {
				circle,
				outputSize,
				margin: 1.05,
				zoom: 1,
				fps: 24,
				rotationSpeed: rotationSpeedValue,
				direction: directionValue
			});

			// Export at 24 FPS for a smooth animation
			const urlGif = await exportGif(frames, 24);
			const a = document.createElement('a');
			a.href = urlGif;
			a.download = 'phenaki-export.gif';
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

	// allow user override for GIF frame count
	let optsGifCount = 24;

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

		// only drag if double-tapped or if dragging the handle
		const isDraggingHandle = e.target && e.target.closest && e.target.closest('.drag-handle');
		if (!isDoubleTap && !isDraggingHandle) return;

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
		<button class={_detectedCircle && !$isPlaying ? 'play-highlight' : ''} on:click={togglePlay}
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
				disabled={busy || !$imageUrl}>Detect Circle & Count</button
			>
		{/if}
		<button on:click={applySuggestedSpeed} disabled={!_suggested}>Apply Suggested Speed</button>
		<button on:click={saveGif} disabled={exporting || !$playerCanvas}
			>{exporting ? 'Exporting...' : 'Save GIF'}</button
		>
		<label style="display:flex;align-items:center;gap:6px;">
			<span style="font-size:12px;opacity:0.8;">Frames:</span>
			<input
				type="number"
				min="3"
				step="1"
				bind:value={optsGifCount}
				style="width:70px;padding:4px;border-radius:4px;border:1px solid #ccc;"
			/>
		</label>
		<label style="display:flex;align-items:center;gap:6px;margin-left:6px;">
			<input
				type="checkbox"
				checked={_overlay}
				on:change={(e) => overlayVisible.set(e.target.checked)}
			/>
			<span>Show Overlay</span>
		</label>
	</div>

	{#if $detectedCircle}
		<div
			class="speed-control {dragMode ? 'dragMode' : ''} {dragging ? 'dragging' : ''}"
			on:pointerdown={onOverlayPointerDown}
			style="left: {overlayPos.left ?? 16}px; top: {overlayPos.top ?? 16}px;"
		>
			{#if dragMode}
				<div class="drag-handle" title="Drag to move"></div>
			{/if}
			<div style="display:flex;gap:12px;align-items:center;">
				<button class="speed-btn" on:click={decreaseSpeed}>−</button>
				<div style="text-align:center;min-width:120px;">
					<div class="speed-display">{$rotationSpeed.toFixed(0)}°/s</div>
					<div style="font-size:11px;opacity:0.6;margin-top:4px;">Rotation Speed</div>
				</div>
				<button class="speed-btn" on:click={increaseSpeed}>+</button>
			</div>
		</div>
	{/if}

	<div style="margin-top:12px;">
		<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
			<div>
				<strong>Current Speed:</strong>
				{$rotationSpeed.toFixed(0)}°/s |
				<em style="font-size:12px;opacity:0.7;">(Touch: drag up to speed up, down to slow down)</em>
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
		<div><strong>Detected count:</strong> {_detectedCount ?? 0}</div>
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
