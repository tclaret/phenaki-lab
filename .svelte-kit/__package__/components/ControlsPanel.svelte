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
          class="flicker-preset-btn"
          on:click={() => flickerFrequency.set(42)}
          style="border: 1px solid {$flickerFrequency === 42 ? '#ff6b6b' : '#555'}; background: {$flickerFrequency === 42 ? '#ff6b6b' : '#333'}; color: white; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
          42 Hz - Strong Flicker
        </button>
        <button 
          class="flicker-preset-btn"
          on:click={() => flickerFrequency.set(50)}
          style="border: 1px solid {$flickerFrequency === 50 ? '#ffa500' : '#555'}; background: {$flickerFrequency === 50 ? '#ffa500' : '#333'}; color: white; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
          50 Hz - Threshold
        </button>
        <button 
          class="flicker-preset-btn"
          on:click={() => flickerFrequency.set(55)}
          style="border: 1px solid {$flickerFrequency === 55 ? '#4a9eff' : '#555'}; background: {$flickerFrequency === 55 ? '#4a9eff' : '#333'}; color: white; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
          55 Hz - Subtle
        </button>
        <button 
          class="flicker-preset-btn"
          on:click={() => flickerFrequency.set(60)}
          style="border: 1px solid {$flickerFrequency === 60 ? '#51cf66' : '#555'}; background: {$flickerFrequency === 60 ? '#51cf66' : '#333'}; color: white; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
          60 Hz - Cinema
        </button>
        <button 
          class="flicker-preset-btn"
          on:click={() => flickerFrequency.set(70)}
          style="border: 1px solid {$flickerFrequency === 70 ? '#845ef7' : '#555'}; background: {$flickerFrequency === 70 ? '#845ef7' : '#333'}; color: white; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
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

    <!-- Pro Tips Section -->
    <details style="margin-top: 15px; padding: 10px; background: rgba(255, 200, 100, 0.05); border-left: 3px solid #ffb84d; border-radius: 4px;">
      <summary style="cursor: pointer; font-weight: 600; color: #ffb84d; font-size: 0.9em; user-select: none;">
        💡 Pro Tips for Best Results
      </summary>
      <div style="margin-top: 10px; font-size: 0.85em; color: #ccc; line-height: 1.6;">
        <div style="margin-bottom: 10px;">
          <strong style="color: #ffb84d;">🎯 Eliminate Drift:</strong><br/>
          <span style="color: #aaa;">If the image appears to slowly rotate while animating, your speed is slightly off. Adjust rotation speed in increments of 1°/s until the center stays perfectly still.</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong style="color: #4a9eff;">🎬 Increase FPS for Fluidity:</strong><br/>
          <span style="color: #aaa;">Higher frequencies (50-60 Hz) reduce choppiness, making the animation feel more like a modern movie and less like a strobe light.</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong style="color: #51cf66;">🎨 High-Contrast Graphics:</strong><br/>
          <span style="color: #aaa;">The flicker works best with sharp contrast between subject and background. Use images with clear, high-contrast frames for optimal results.</span>
        </div>
        <div style="margin-bottom: 0;">
          <strong style="color: #845ef7;">💡 Optimal Lighting:</strong><br/>
          <span style="color: #aaa;">In bright rooms, the "dark" flicker phase may not feel dark enough. Dim your room lights to make the flicker effect feel stronger and clearer.</span>
        </div>
      </div>
    </details>
  {/if}
</div>

<style>
  .flicker-preset-btn {
    padding: 6px 12px;
    font-size: 0.85em;
  }
  
  /* Mobile optimizations for better touch interaction */
  @media (max-width: 768px) {
    .flicker-preset-btn {
      min-height: 48px;
      padding: 12px 18px;
      font-size: 1em;
    }
  }
</style>
