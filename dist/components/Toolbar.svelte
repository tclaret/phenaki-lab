<!-- src/lib/components/Toolbar.svelte -->
<script>
  import { animationSpeed, slits, slitLength } from '../store';
</script>

<div class="panel">
  <h2>Controls</h2>

  <div class="control">
    <label for="speed">Speed</label>
    <input id="speed" type="range" min="0.1" max="5" step="0.1" bind:value={$animationSpeed} />
    <span>{$animationSpeed}</span>
  </div>

  <div class="control">
    <label for="slits">Slits</label>
    <input id="slits" type="range" min="4" max="60" step="1" bind:value={$slits} />
    <span>{$slits}</span>
  </div>

  <div class="control">
    <label for="slitLen">Slit Length</label>
    <input id="slitLen" type="range" min="1" max="40" step="1" bind:value={$slitLength} />
    <span>{$slitLength}°</span>
  </div>
</div>

<style>
.panel {
  background-color: #222;
  color: #eee;
  padding: 16px;
  border-radius: 12px;
  margin-top: 20px;
}
.control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
input[type="range"] {
  flex: 1;
}
span {
  width: 40px;
  text-align: right;
}
</style>

