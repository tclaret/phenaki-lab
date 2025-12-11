<script>
	import { onMount } from 'svelte';
	import { imageUrl, previewUrl, isPlaying } from '$lib/store';

	const GITHUB_RAW_URL_OLD =
		'https://raw.githubusercontent.com/tclaret/phenakistoscope-simulator/main/images';
	const GITHUB_RAW_URL_NEW = 'https://raw.githubusercontent.com/tclaret/phenaki-lab/main/img';

	const samples = [
		{ name: 'Woman Chopping Tree', file: 'WomanChoppingTree.jpg', repo: 'old' },
		{ name: 'Dancing', file: 'Dancing.jpg', repo: 'old' },
		{ name: 'Jongleur', file: 'Jongleur.png', repo: 'old' },
		{ name: 'a_cheval', file: 'a_cheval.png', repo: 'old' },
		{ name: 'McLean_1', file: 'McLean_1.png', repo: 'old' },
		{ name: 'Gernamy_1949', file: 'Gernamy_1949_R_Balzer.png', repo: 'old' },
		{ name: 'AEO175939', file: 'AEO175939_PhenakistoscopeGiroux60.jpg', repo: 'old' },
		{ name: 'AEO185553', file: 'AEO185553_PhenakistiscopeDisc_ManInBlueAndRed.jpg', repo: 'old' },
		{ name: 'medium_1990_5036_3369', file: 'medium_1990_5036_3369.jpg', repo: 'old' },
		{ name: 'medium_a001813b', file: 'medium_a001813b.jpg', repo: 'old' },
		{ name: 'tumblr_obd6fh', file: 'tumblr_obd6fhGFSZ1r9jbwno1_500.png', repo: 'old' },
		{ name: 'tumblr_oc1cz', file: 'tumblr_oc1czn99ZM1r9jbwno1_500.png', repo: 'old' },
		{ name: 'Phantasmascope Faces', file: 'Phantasmascope_faces.png', repo: 'old' },
		{ name: '722a6790240569.5e126845d9b56', file: '722a6790240569.5e126845d9b56.png', repo: 'old' },
		{ name: 'Fantascope Disc 1833', file: 'fantascope-disc-1833.png', repo: 'old' },
		{ name: 'Face', file: '_face__.jpg', repo: 'new' },
		{ name: 'Culbute', file: 'culbute.jpg', repo: 'new' },
		{ name: 'Grenouille', file: 'Grenouille__.jpg', repo: 'new' },
		{ name: 'Oh Soccer', file: 'oh_soccer.jpg', repo: 'new' },
		{ name: 'Un Grand Un Petit', file: 'un_grand_un_petit.jpg', repo: 'new' },
		{ name: 'Autre Culbutte', file: 'autre_culbutte.jpg', repo: 'new' },
		{ name: 'Dancing 2', file: 'dancing_.jpg', repo: 'new' },
		{ name: "Il Pompe de l'eau", file: 'il_pompe_de_leau.jpg', repo: 'new' },
		{ name: 'Porceline', file: 'porceline.jpg', repo: 'new' },
		{ name: 'Volants', file: 'volants_.png', repo: 'new' },
		{ name: 'Ce Qui', file: 'ce_qui.jpg', repo: 'new' },
		{ name: 'Des Anges', file: 'des_anges.jpg', repo: 'new' },
		{ name: 'Moulin', file: 'moulin_.jpg', repo: 'new' },
		{ name: 'Rats', file: 'rats__.jpg', repo: 'new' },
		{ name: 'Corde à Danser', file: 'corde_a_denser_.jpg', repo: 'new' },
		{ name: 'Ecureuil', file: 'ecureuil.jpg', repo: 'new' },
		{ name: 'Noel Noel', file: 'noel_noel.jpg', repo: 'new' },
		{ name: 'Tirreur', file: 'tirreur_.jpg', repo: 'new' },
		{ name: 'C Pastel', file: 'c_pastel.jpg', repo: 'new' },
		{ name: 'Géométrique', file: 'geometrique.jpg', repo: 'new' },
		{ name: 'Nuages en Scie', file: 'nuages_en_scie.jpg', repo: 'new' },
		{ name: 'Tons Pastels', file: 'tons_pastels.jpg', repo: 'new' }
	];

	function selectSample(sample) {
		const baseUrl = sample.repo === 'new' ? GITHUB_RAW_URL_NEW : GITHUB_RAW_URL_OLD;
		const url = `${baseUrl}/${sample.file}`;
		imageUrl.set(url);
		previewUrl.set(url);
		isPlaying.set(true);
	}

	// pick a random starting image if none is already selected
	onMount(() => {
		let already = false;
		const unsub = imageUrl.subscribe((v) => {
			if (v) already = true;
		});
		unsub();
		if (!already) {
			const s = samples[Math.floor(Math.random() * samples.length)];
			if (s) selectSample(s);
		}
	});
</script>

<div class="selector">
	<label for="samples">Sample Images:</label>
	<select
		id="samples"
		on:change={(e) => {
			const idx = e.target.selectedIndex - 1;
			if (idx >= 0) selectSample(samples[idx]);
		}}
	>
		<option value="">-- Choose a sample --</option>
		{#each samples as sample (sample.file)}
			<option value={sample.file}>{sample.name}</option>
		{/each}
	</select>
</div>

<style>
	.selector {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}
	label {
		font-weight: 600;
	}
	select {
		padding: 6px 10px;
		border: 1px solid #555;
		background: #222;
		color: #fff;
		border-radius: 4px;
		cursor: pointer;
	}
	select:hover {
		border-color: #777;
	}
</style>
