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

  <h3 style="margin-top: 20px; font-size: 1.1em;">Flicker Fusion Threshold</h3>
  <p style="font-size: 0.85em; color: #aaa; margin: 5px 0 10px;">
    Simulates the <a href="https://en.wikipedia.org/wiki/Flicker_fusion_threshold" target="_blank" style="color: #4af">flicker fusion threshold</a> effect.
    The human eye typically fuses flicker at 50-60 Hz.
  </p>

  <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
    <input type="checkbox" bind:checked={$flickerEnabled} />
    <span style="font-weight: 500;">Enable Flicker Effect</span>
    {#if $flickerEnabled}
      <span style="margin-left: auto; background: #4a9eff; color: white; padding: 2px 10px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
        {$flickerFrequency} Hz
      </span>
    {/if}
  </label>

  {#if $flickerEnabled}
    <!-- Quick Presets -->
    <div style="margin: 10px 0;">
      <div style="font-size: 0.9em; color: #aaa; margin-bottom: 6px;">Quick Presets:</div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <button 
          on:click={() => flickerFrequency.set(42)}
          style="padding: 6px 12px; border: 1px solid {$flickerFrequency === 42 ? '#ff6b6b' : '#555'}; background: {$flickerFrequency === 42 ? '#ff6b6b' : '#333'}; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: all 0.2s;">
          42 Hz - Strong Flicker
        </button>
        <button 
          on:click={() => flickerFrequency.set(50)}
          style="padding: 6px 12px; border: 1px solid {$flickerFrequency === 50 ? '#ffa500' : '#555'}; background: {$flickerFrequency === 50 ? '#ffa500' : '#333'}; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: all 0.2s;">
          50 Hz - Threshold
        </button>
        <button 
          on:click={() => flickerFrequency.set(55)}
          style="padding: 6px 12px; border: 1px solid {$flickerFrequency === 55 ? '#4a9eff' : '#555'}; background: {$flickerFrequency === 55 ? '#4a9eff' : '#333'}; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: all 0.2s;">
          55 Hz - Subtle
        </button>
        <button 
          on:click={() => flickerFrequency.set(60)}
          style="padding: 6px 12px; border: 1px solid {$flickerFrequency === 60 ? '#51cf66' : '#555'}; background: {$flickerFrequency === 60 ? '#51cf66' : '#333'}; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: all 0.2s;">
          60 Hz - Cinema
        </button>
        <button 
          on:click={() => flickerFrequency.set(70)}
          style="padding: 6px 12px; border: 1px solid {$flickerFrequency === 70 ? '#845ef7' : '#555'}; background: {$flickerFrequency === 70 ? '#845ef7' : '#333'}; color: white; border-radius: 4px; cursor: pointer; font-size: 0.85em; transition: all 0.2s;">
          70 Hz - Smooth
        </button>
      </div>
    </div>

    <!-- Fine Control Slider -->
    <label style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 500;">Fine Tune:</span>
        <span style="font-size: 1.2em; font-weight: bold; color: #4a9eff;">{$flickerFrequency} Hz</span>
      </div>
      <input 
        type="range" 
        min="40" 
        max="70" 
        step="0.5" 
        value={$flickerFrequency}
        on:input={(e)=>flickerFrequency.set(+e.target.value)}
        style="width: 100%; cursor: pointer;" />
      <div style="display: flex; justify-content: space-between; font-size: 0.75em; color: #666;">
        <span>40 Hz</span>
        <span style="color: #4a9eff; font-weight: 500;">
          {#if $flickerFrequency < 48}
            🔴 Visible Flicker
          {:else if $flickerFrequency < 58}
            🟡 Fusion Zone
          {:else}
            🟢 Smooth Motion
          {/if}
        </span>
        <span>70 Hz</span>
      </div>
    </label>

    <!-- Visual Guide -->
    <div style="margin-top: 12px; padding: 10px; background: rgba(74, 158, 255, 0.1); border-left: 3px solid #4a9eff; border-radius: 4px; font-size: 0.85em;">
      <div style="font-weight: 500; margin-bottom: 4px; color: #4a9eff;">
        {#if $flickerFrequency < 48}
          ⚡ High Flicker Mode
        {:else if $flickerFrequency < 52}
          🎯 Critical Fusion Threshold
        {:else if $flickerFrequency < 58}
          ✨ Near-Fusion Zone
        {:else if $flickerFrequency < 62}
          🎬 Cinema Standard (60 Hz)
        {:else}
          🌟 Ultra Smooth
        {/if}
      </div>
      <div style="color: #aaa; font-size: 0.9em;">
        {#if $flickerFrequency < 48}
          Strong, noticeable flicker - classic phenakistoscope effect
        {:else if $flickerFrequency < 52}
          Perceptible flicker begins to fuse - the critical threshold
        {:else if $flickerFrequency < 58}
          Subtle pulsing effect - artistic sweet spot
        {:else if $flickerFrequency < 62}
          Standard cinema/TV refresh rate - minimal flicker
        {:else}
          Above typical fusion threshold - very smooth motion
        {/if}
      </div>
    </div>
  {/if}
</div>

