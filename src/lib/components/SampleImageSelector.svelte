<script>
	import { onMount } from 'svelte';
	import { 
		imageUrl, 
		previewUrl, 
		isPlaying, 
		selectedImageName,
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
	} from '../store';

	const GITHUB_RAW_URL_OLD =
		'https://raw.githubusercontent.com/tclaret/phenakistoscope-simulator/main/images';
	const GITHUB_RAW_URL_NEW = 'https://raw.githubusercontent.com/tclaret/phenaki-lab/main/img';

	const samples = [
		{ name: 'Colors', file: 'colors.png', repo: 'new' },
		{ name: 'Medium 1990', file: 'medium_1990_5036_7181_6_1.png', repo: 'new' },
		{ name: 'Cats et Donkey', file: 'optical-toy-phenakistiscope-disc-avec-cats-et-donkey-ca-1830-2efx315.jpg', repo: 'new' },
		{ name: 'Dancing Man Animated', file: 'Optical_Toy,_Phenakistiscope_Disc_with_Dancing_Man,_ca._1835-Animated.jpg', repo: 'new' },
		{ name: 'Phénakistiscope 2', file: 'phénakistiscope2.png', repo: 'new' },
		{ name: 'Disque Animation 29', file: 'phenakistiscope-disque-animation-29.jpg', repo: 'new' },
		{ name: 'S-L1600 1', file: 's-l1600_1.jpg', repo: 'new' },
		{ name: 'S-L1600', file: 's-l1600.jpg', repo: 'new' },
		{ name: 'Hash 045377', file: '045377654e8832d31b850c8c4b7f948b.png', repo: 'new' },
		{ name: 'Hash 062901', file: '062901e866b6aca4078ae7ff0be74c24.png', repo: 'new' },
		{ name: 'Hash 0a23fe', file: '0a23fe78862b095518e46a3472238510.png', repo: 'new' },
		{ name: 'Hash 14ea08', file: '14ea08f701861d967d455220ea8ca7ed.jpg', repo: 'new' },
		{ name: 'Hash 1928bd', file: '1928bda6cad5fd3cd27d13ce70a502dc.jpg', repo: 'new' },
		{ name: 'Hash 2d003d', file: '2d003d9b4e81a933bbfbdd55c8b1e261.png', repo: 'new' },
		{ name: 'Hash 2e4cd2', file: '2e4cd248fbe57af9798c7e3c1c23b58c.jpg', repo: 'new' },
		{ name: 'Hash 40bd2a', file: '40bd2aead0fc9a6e77d23871555a2998.png', repo: 'new' },
		{ name: 'Hash 43efde', file: '43efdef999a2fa3200506f97d9e1ef10.png', repo: 'new' },
		{ name: 'Hash 494697', file: '49469753b75adf62fe324641a2869c53.png', repo: 'new' },
		{ name: 'Hash 4ca70e', file: '4ca70ec79b59935fb0eed9992045e4fb.jpg', repo: 'new' },
		{ name: 'Hash 4e6b0c', file: '4e6b0c0e4fde0ad2ad8f4797304b037b.jpg', repo: 'new' },
		{ name: 'Hash 4f3ab9', file: '4f3ab9e63d43062d25dfc6e4108635fb.png', repo: 'new' },
		{ name: 'Hash 686b5e', file: '686b5e679b990dd996d0a4a3fb943d2d.png', repo: 'new' },
		{ name: 'Hash 6f5755', file: '6f57558627d849a8d2b3f9a430bacba2.jpg', repo: 'new' },
		{ name: 'Hash 75fd29', file: '75fd29a0318c3cf0fdaf8a41d1406cf2.png', repo: 'new' },
		{ name: 'Hash 8efd4b', file: '8efd4b2b51765d9efdde621251b08968.jpg', repo: 'new' },
		{ name: 'Hash 90cbee', file: '90cbeedafdef22534d24d04bc44b518f.jpg', repo: 'new' },
		{ name: 'Hash 954abf', file: '954abf22a1f89759204818d3c0592234.png', repo: 'new' },
		{ name: 'Hash 9799d6', file: '9799d6d1766b1add766629adec031867.png', repo: 'new' },
		{ name: 'Hash a0767f', file: 'a0767fc0712f1a9eeac238e72b6b2721.png', repo: 'new' },
		{ name: 'Hash b18a11', file: 'b18a11d1a8355081b70a3d91347236b1.jpg', repo: 'new' },
		{ name: 'Hash bf2932', file: 'bf29325ee951619c061902200c8e1143.png', repo: 'new' },
		{ name: 'Hash e1de4a', file: 'e1de4a32cb1bafa33166d51bf8ae2f35.png', repo: 'new' },
		{ name: 'Hash e59f95', file: 'e59f952d6ef4e9c391ea10e143e55b23.png', repo: 'new' },
		{ name: 'Hash e6582e', file: 'e6582e848b0aca99c134d23365c08fdb.png', repo: 'new' },
		{ name: 'Hash ebd3d3', file: 'ebd3d33285d243f86e54df78b9cc69ac.png', repo: 'new' },
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
		{ name: 'Face', file: 'a_face__.jpg', repo: 'new' },
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
		{ name: 'Tons Pastels', file: 'tons_pastels.jpg', repo: 'new' },
		{ name: 'Des Ouiseaux', file: 'DesOuaisaux.png', repo: 'new' },
		{ name: 'Feels Like Flying', file: 'feels_like_flying.png', repo: 'new' },
		{ name: 'Gros Meusieur', file: 'GrosMeusieur.png', repo: 'new' },
		{ name: 'Jongle avec les Otaries', file: 'Jongle_avec_les_otaries.png', repo: 'new' },
		{ name: 'Cinémathèque 1', file: 'cinemateque_francaise_1.png', repo: 'new' },
		{ name: 'Cinémathèque 2', file: 'cinemateque_francaise_2.png', repo: 'new' },
		{ name: 'Cinémathèque 3', file: 'cinemateque_francaise_3.png', repo: 'new' },
		{ name: 'Cinémathèque 4', file: 'cinemateque_francaise_4.png', repo: 'new' },
		{ name: 'Cinémathèque 5', file: 'cinemateque_francaise_5.png', repo: 'new' },
		{ name: 'Cinémathèque 6', file: 'cinemateque_francaise_6.png', repo: 'new' },
		{ name: 'Cinémathèque 7', file: 'cinemateque_francaise_7.png', repo: 'new' },
		{ name: 'Cinémathèque 8', file: 'cinemateque_francaise_8.png', repo: 'new' },
		{ name: 'Cinémathèque 9', file: 'cinemateque_francaise_9.png', repo: 'new' },
		{ name: 'Cinémathèque 10', file: 'cinemateque_francaise_10.png', repo: 'new' },
		{ name: 'Cinémathèque 11', file: 'cinemateque_francaise_11.png', repo: 'new' },
		{ name: 'Cinémathèque 12', file: 'cinemateque_francaise_12.png', repo: 'new' },
		{ name: 'Cinémathèque 13', file: 'cinemateque_francaise_13.png', repo: 'new' },
		{ name: 'Cinémathèque 14', file: 'cinemateque_francaise_14.png', repo: 'new' },
		{ name: 'Cinémathèque 15', file: 'cinemateque_francaise_15.png', repo: 'new' },
		{ name: 'Cinémathèque 16', file: 'cinemateque_francaise_16.png', repo: 'new' },
		{ name: 'Cinémathèque 17', file: 'cinemateque_francaise_17.png', repo: 'new' },
		{ name: 'Cinémathèque 18', file: 'cinemateque_francaise_18.png', repo: 'new' },
		{ name: 'Cinémathèque 19', file: 'cinemateque_francaise_19.png', repo: 'new' },
		{ name: 'Cinémathèque 20', file: 'cinemateque_francaise_20.png', repo: 'new' },
		{ name: 'Cinémathèque 21', file: 'cinemateque_francaise_21.png', repo: 'new' },
		{ name: 'Cinémathèque 22', file: 'cinemateque_francaise_22.png', repo: 'new' },
		{ name: 'Cinémathèque 23', file: 'cinemateque_francaise_23.png', repo: 'new' },
		{ name: 'Cinémathèque 24', file: 'cinemateque_francaise_24.png', repo: 'new' },
		{ name: 'Cinémathèque 25', file: 'cinemateque_francaise_25.png', repo: 'new' },
		{ name: 'Cinémathèque 26', file: 'cinemateque_francaise_26.png', repo: 'new' },
		{ name: 'Cinémathèque 27', file: 'cinemateque_francaise_27.png', repo: 'new' },
		{ name: 'Cinémathèque 28', file: 'cinemateque_francaise_28.png', repo: 'new' },
		{ name: 'Cinémathèque 29', file: 'cinemateque_francaise_29.png', repo: 'new' },
		{ name: 'Cinémathèque 30', file: 'cinemateque_francaise_30.png', repo: 'new' },
		{ name: 'Cinémathèque 31', file: 'cinemateque_francaise_31.png', repo: 'new' },
		{ name: 'Cinémathèque 32', file: 'cinemateque_francaise_32.png', repo: 'new' },
		{ name: 'Cinémathèque 33', file: 'cinemateque_francaise_33.png', repo: 'new' },
		{ name: 'Cinémathèque 34', file: 'cinemateque_francaise_34.png', repo: 'new' },
		{ name: 'Phenakistoscope 3g07692a', file: 'Phenakistoscope_3g07692a.jpg', repo: 'new' },
		{ name: 'Phenakistoscope 3g07692u', file: 'Phenakistoscope_3g07692u.jpg', repo: 'new' },
		{ name: 'Lebensrad 01', file: 'Lebensrad01.jpg', repo: 'new' },
		{ name: 'Dance Dance', file: 'Dance_dance.png', repo: 'new' },
		{ name: 'Download', file: 'download.png', repo: 'new' },
		{ name: 'Serpent', file: 'serpent.png', repo: 'new' },
		{ name: 'Zoopraxiscope 0', file: 'zoopraxiscope-0.png', repo: 'new' },
		{ name: 'S-L1600 PNG', file: 's-l1600.png', repo: 'new' },
		{ name: '1200px Cats and Donkey', file: '1200px-Optical_Toy,_Phenakistiscope_Disc_with_Cats_and_Donkey,_ca._1830_(CH_18607981).jpg', repo: 'new' },
		{ name: 'Photographic Pastimes', file: 'Photographic_pastimes_-_a_series_of_interesting_experiments_for_amateurs_for_obtaining_novel_and_curious_effects_with_the_aid_of_the_camera_(1891)_(14766082535).jpg', repo: 'new' },
		{ name: 'IL 1588 2019925483', file: 'il_1588xN.2019925483_gcfc.jpg', repo: 'new' },
		{ name: 'IL 1588 7127245108', file: 'il_1588xN.7127245108_4tnw.png', repo: 'new' },
		{ name: 'IL 1588 7287092618', file: 'il_1588xN.7287092618_bs1i.png', repo: 'new' }
	];

	let selectedSampleFile = '';

	function selectSample(sample) {
		const baseUrl = sample.repo === 'new' ? GITHUB_RAW_URL_NEW : GITHUB_RAW_URL_OLD;
		const url = `${baseUrl}/${sample.file}`;
		
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
		
		imageUrl.set(url);
		previewUrl.set(url);
		isPlaying.set(false);
		selectedImageName.set(sample.name);
		selectedSampleFile = sample.file;
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
	{#if $selectedImageName}
		<span class="current-image" title="Currently loaded image">📷 {$selectedImageName}</span>
	{/if}
	<select
		id="samples"
		bind:value={selectedSampleFile}
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
	.current-image {
		color: #0096ff;
		font-weight: 500;
		padding: 4px 8px;
		background: rgba(0, 150, 255, 0.1);
		border-radius: 4px;
		font-size: 14px;
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
	
	/* Mobile-friendly touch target */
	@media (max-width: 768px) {
		select {
			min-height: 44px;
			padding: 10px 12px;
			font-size: 16px;
		}
	}
</style>
