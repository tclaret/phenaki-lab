<script>
  import { previewUrl, imageUrl, isPlaying } from "$lib/store";

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;

    const url = URL.createObjectURL(f);

    previewUrl.set(url);
    imageUrl.set(url);

    isPlaying.set(true);
  }
</script>

<label>
  Choose image:
  <input type="file" accept="image/*" on:change={handleFile} />
</label>
