<script>
  import FileUploader from "$lib/components/FileUploader.svelte";
  import ImagePreview from "$lib/components/ImagePreview.svelte";
  import CanvasPlayer from "$lib/components/CanvasPlayer.svelte";
  import AnalyzerPanel from "$lib/components/AnalyzerPanel.svelte";
  import SampleImageSelector from "$lib/components/SampleImageSelector.svelte";
</script>

<div class="container">
  <h1>Phenakistoscope Lab</h1>
  <p class="sub">Convert old phenakistoscope discs into animated GIFs</p>

  <FileUploader />
  <SampleImageSelector />
  <ImagePreview />
  <CanvasPlayer />
  <AnalyzerPanel />
</div>

<style>
h1 {
  margin-top: 10px;
}
.sub {
  opacity: 0.6;
  margin-bottom: 20px;
}
.container {
  max-width: 800px;
  margin: auto;
  padding: 10px;
}
</style>

