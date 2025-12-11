<script>
  import { params, flickerEnabled, flickerFrequency } from '../store';

  function update(key, value) {
    params.update(p => ({ ...p, [key]: value }));
  }
</script>

<div class="panel">
  <h2>Animation Controls</h2>

  <label>
    Sectors: { $params.sectors }
    <input type="range" min="1" max="32" value={$params.sectors}
      on:input={(e)=>update("sectors", +e.target.value)} />
  </label>

  <label>
    Duration: { $params.duration }s
    <input type="range" min="1" max="10" value={$params.duration}
      on:input={(e)=>update("duration", +e.target.value)} />
  </label>

  <label>
    Easing
    <select bind:value={$params.easing} on:change={(e)=>update("easing", e.target.value)}>
      <option value="linear">Linear</option>
      <option value="ease-in">Ease-in</option>
      <option value="ease-out">Ease-out</option>
      <option value="ease-in-out">Ease-in-out</option>
    </select>
  </label>

  <label>
    <input type="checkbox" bind:checked={$params.loop}
      on:change={(e)=>update("loop", e.target.checked)} />
    Loop
  </label>

  <hr style="margin: 20px 0; border: 1px solid #333;" />

  <h3 style="margin-top: 20px; font-size: 1.1em;">Flicker Effect</h3>
  <p style="font-size: 0.85em; color: #aaa; margin: 5px 0 10px;">
    Simulates the <a href="https://en.wikipedia.org/wiki/Flicker_fusion_threshold" target="_blank" style="color: #4af">flicker fusion threshold</a> effect
  </p>

  <label>
    <input type="checkbox" bind:checked={$flickerEnabled} />
    Enable Flicker
  </label>

  {#if $flickerEnabled}
    <label>
      Frequency: {$flickerFrequency} Hz
      <input type="range" min="1" max="60" value={$flickerFrequency}
        on:input={(e)=>flickerFrequency.set(+e.target.value)} />
    </label>
  {/if}
</div>

