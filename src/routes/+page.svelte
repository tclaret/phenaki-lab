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
  
  <div class="wiki-link">
    <a href="https://en.wikipedia.org/wiki/Phenakistiscope" target="_blank" rel="noopener noreferrer">
      ℹ️ Learn about Phenakistoscopes
    </a>
  </div>

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
}
.wiki-link {
  margin-bottom: 16px;
}
.wiki-link a {
  color: #0096ff;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.wiki-link a:hover {
  text-decoration: underline;
  line-height: 1.5;
  opacity: 0.9;
}
.container {
  max-width: 800px;
  margin: auto;
  padding: 10px;
}
</style>

