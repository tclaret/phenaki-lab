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
  
  <div class="intro">
    <p>To create an animated GIF from a phenakistoscope image, select the correct number of frames according to the image, adjust the rotation speed, and then save it as a fast, slow, or normal animated GIF depending on your settings.</p>
  </div>

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
.intro {
  background: rgba(0, 150, 255, 0.1);
  border-left: 3px solid #0096ff;
  padding: 12px 16px;
  margin-bottom: 24px;
  border-radius: 4px;
}
.intro p {
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}
.container {
  max-width: 800px;
  margin: auto;
  padding: 10px;
}
</style>

