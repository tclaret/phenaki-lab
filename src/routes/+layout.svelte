<script>
  import "@fortawesome/fontawesome-free/css/all.min.css";
</script>

<div class="app">
  <header>
    <h1>Phenakistoscope Lab</h1>
    <nav>
      <a href="/gif">Convert old phenakistoscope discs into anomation</a>
    </nav>
  </header>

  <slot />
</div>

<style>
  :global(body) { margin: 0; font-family: system-ui; background: #111; color: white; }
  header {
    padding: 20px;
    background: #181818;
    border-bottom: 1px solid #333;
  }
  header h1 {
    color: white;
    margin: 0;
    font-weight: 700;
  }
  nav a {
    margin-right: 20px;
    color: #aaa;
    text-decoration: none;
  }
  nav a:hover { color: white; }
</style>

