<script>
  import { onMount } from 'svelte';
  import { imageUrl, previewUrl, isPlaying } from "../store";

  const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/tclaret/phenakistoscope-simulator/main/images';

  const samples = [
    { name: 'Woman Chopping Tree', file: 'WomanChoppingTree.jpg' },
    { name: 'Dancing', file: 'Dancing.jpg' },
    { name: 'Jongleur', file: 'Jongleur.png' },
    { name: 'a_cheval', file: 'a_cheval.png' },
    { name: 'McLean_1', file: 'McLean_1.png' },
    { name: 'Gernamy_1949', file: 'Gernamy_1949_R_Balzer.png' },
    { name: 'AEO175939', file: 'AEO175939_PhenakistoscopeGiroux60.jpg' },
    { name: 'AEO185553', file: 'AEO185553_PhenakistiscopeDisc_ManInBlueAndRed.jpg' },
    { name: 'medium_1990_5036_3369', file: 'medium_1990_5036_3369.jpg' },
    { name: 'medium_a001813b', file: 'medium_a001813b.jpg' },
    { name: 'tumblr_obd6fh', file: 'tumblr_obd6fhGFSZ1r9jbwno1_500.png' },
    { name: 'tumblr_oc1cz', file: 'tumblr_oc1czn99ZM1r9jbwno1_500.png' },
    { name: 'Phantasmascope Faces', file: 'Phantasmascope_faces.png' },
    { name: '722a6790240569.5e126845d9b56', file: '722a6790240569.5e126845d9b56.png' },
    { name: 'Fantascope Disc 1833', file: 'fantascope-disc-1833.png' },
  ];

  function selectSample(file) {
    const url = `${GITHUB_RAW_URL}/${file}`;
    imageUrl.set(url);
    previewUrl.set(url);
    isPlaying.set(true);
  }

  // pick a random starting image if none is already selected
  onMount(() => {
    let already = false;
    const unsub = imageUrl.subscribe(v => { if (v) already = true; });
    unsub();
    if (!already) {
      const s = samples[Math.floor(Math.random() * samples.length)];
      if (s) selectSample(s.file);
    }
  });
</script>

<div class="selector">
  <label for="samples">Sample Images:</label>
  <select id="samples" on:change={(e) => e.target.value && selectSample(e.target.value)}>
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
