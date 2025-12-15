<script>
  import { previewUrl } from "$lib/store";
  // Use Svelte store auto-subscription
  $: currentPreview = $previewUrl;
</script>

{#if currentPreview}
  <div class="preview">
    <img src={currentPreview} alt="Selected disc preview" />
  </div>
{/if}

<style>
  .preview {
    margin-top: 10px;
    border: 1px solid #333;
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background: #111;
  }

  .preview img {
    max-width: 100%;
    max-height: 100%;
  }
</style>


