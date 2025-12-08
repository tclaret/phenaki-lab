<script>
	import {
		isPlaying,
		animationSpeed,
		frameCount,
		rotationDirection,
		rotationAngle
	} from '../store';

	let raf;
	let angle = 0; // angle local pour l’animation mockée

	function togglePlay() {
		isPlaying.set(!$isPlaying);

		if ($isPlaying) startAnimation();
		else stopAnimation();
	}

	function startAnimation() {
		stopAnimation();

		const loop = () => {
			angle += 0.03 * $animationSpeed * $rotationDirection;
			rotationAngle.set(angle);

			raf = requestAnimationFrame(loop);
		};

		loop();
	}

	function stopAnimation() {
		if (raf) cancelAnimationFrame(raf);
	}
</script>

<div class="panel">
	<div class="controls">
		<button on:click={togglePlay}>
			{#if $isPlaying}
				⏸ Pause
			{:else}
				▶️ Play
			{/if}
		</button>

		<div class="options">
			<p>Vitesse : {$animationSpeed}</p>
			<p>Frames : {$frameCount}</p>
			<p>Direction : {$rotationDirection}</p>
		</div>
	</div>
</div>

<style>
	.panel {
		padding: 1rem;
		background: #222;
		color: white;
		border-radius: 8px;
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		border-radius: 6px;
	}
</style>
