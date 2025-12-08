import { V as store_get, W as attr, X as unsubscribe_stores, Y as attr_class, Z as clsx, _ as attr_style, $ as stringify, a0 as ensure_array_like } from "../../chunks/index2.js";
import { w as writable } from "../../chunks/index.js";
import { b as ssr_context, e as escape_html } from "../../chunks/context.js";
import "gif.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const previewUrl = writable(null);
const imageUrl = writable(null);
const isPlaying = writable(false);
const rotationSpeed = writable(360);
const rotationDirection = writable(1);
const detectedCircle = writable(null);
const detectedCount = writable(0);
const suggestedRotationSpeed = writable(1);
const overlayVisible = writable(false);
const detectionAnimation = writable({
  active: false,
  progress: 0,
  // 0 to 1
  startTime: 0
});
const playerCanvas = writable(null);
function FileUploader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<label>Choose image: <input type="file" accept="image/*"/></label>`);
  });
}
function ImagePreview($$renderer) {
  var $$store_subs;
  let currentPreview;
  currentPreview = store_get($$store_subs ??= {}, "$previewUrl", previewUrl);
  if (currentPreview) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="preview svelte-1th6cal"><img${attr("src", currentPreview)} alt="Selected disc preview" class="svelte-1th6cal"/></div>f`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function CanvasPlayer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let angle = 0;
    let raf;
    let lastTime = 0;
    let htmlImg = null;
    let imageReady = false;
    function loadImage(url) {
      imageReady = false;
      htmlImg = new Image();
      htmlImg.crossOrigin = "anonymous";
      htmlImg.onload = () => {
        imageReady = true;
      };
      htmlImg.onerror = (e) => {
        console.error("Erreur chargement:", url, e);
        imageReady = false;
      };
      htmlImg.src = url;
    }
    onDestroy(() => {
      if (raf) cancelAnimationFrame(raf);
      playerCanvas.set(null);
    });
    function loop(ts) {
      const isPlayingOrAnimating = store_get($$store_subs ??= {}, "$isPlaying", isPlaying) || store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).active;
      if (!isPlayingOrAnimating || !imageReady) {
        lastTime = 0;
        if (!isPlayingOrAnimating && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
        return;
      }
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime;
      lastTime = ts;
      const degPerSec = store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed) || 0;
      angle += degPerSec * (store_get($$store_subs ??= {}, "$rotationDirection", rotationDirection) || 1) * (dt / 1e3);
      raf = requestAnimationFrame(loop);
    }
    if (store_get($$store_subs ??= {}, "$imageUrl", imageUrl)) {
      loadImage(store_get($$store_subs ??= {}, "$imageUrl", imageUrl));
    } else {
      if (htmlImg) htmlImg = null;
      imageReady = false;
    }
    if (store_get($$store_subs ??= {}, "$isPlaying", isPlaying) || store_get($$store_subs ??= {}, "$detectionAnimation", detectionAnimation).active) {
      if (!raf) raf = requestAnimationFrame(loop);
    } else {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
        lastTime = 0;
      }
    }
    $$renderer2.push(`<div class="canvas-wrapper svelte-byh4af"><canvas class="svelte-byh4af"></canvas> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function AnalyzerPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let _detectedCircle, _detectedCount, _suggested, _overlay;
    let manualSpeed = 0;
    let optsGifCount = 24;
    manualSpeed = Number(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed) || 0);
    _detectedCircle = store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle);
    _detectedCount = store_get($$store_subs ??= {}, "$detectedCount", detectedCount);
    _suggested = store_get($$store_subs ??= {}, "$suggestedRotationSpeed", suggestedRotationSpeed);
    _overlay = store_get($$store_subs ??= {}, "$overlayVisible", overlayVisible);
    $$renderer2.push(`<div class="panel svelte-14nyow8">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;" class="svelte-14nyow8"><button class="svelte-14nyow8">${escape_html(store_get($$store_subs ??= {}, "$isPlaying", isPlaying) ? "Pause" : "Play")}</button> <button class="svelte-14nyow8">Reverse</button> <button${attr_class(clsx(!_detectedCircle ? "detect-btn-required" : ""), "svelte-14nyow8")}${attr("disabled", !store_get($$store_subs ??= {}, "$imageUrl", imageUrl), true)}>Detect Circle &amp; Count</button> <button${attr("disabled", !_suggested, true)} class="svelte-14nyow8">Apply Suggested Speed</button> <button${attr("disabled", !store_get($$store_subs ??= {}, "$playerCanvas", playerCanvas), true)} class="svelte-14nyow8">${escape_html("Save GIF")}</button> <label style="display:flex;align-items:center;gap:6px;" class="svelte-14nyow8"><span style="font-size:12px;opacity:0.8;" class="svelte-14nyow8">Frames:</span> <input type="number" min="3" step="1"${attr("value", optsGifCount)} style="width:70px;padding:4px;border-radius:4px;border:1px solid #ccc;" class="svelte-14nyow8"/></label> <label style="display:flex;align-items:center;gap:6px;margin-left:6px;" class="svelte-14nyow8"><input type="checkbox"${attr("checked", _overlay, true)} class="svelte-14nyow8"/> <span class="svelte-14nyow8">Show Overlay</span></label></div> `);
    if (store_get($$store_subs ??= {}, "$detectedCircle", detectedCircle)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class(`speed-control ${stringify("")} ${stringify("")}`, "svelte-14nyow8")}${attr_style(`left: ${stringify(16)}px; top: ${stringify(16)}px;`)}>`);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div style="display:flex;gap:12px;align-items:center;" class="svelte-14nyow8"><button class="speed-btn svelte-14nyow8">−</button> <div style="text-align:center;min-width:120px;" class="svelte-14nyow8"><div class="speed-display svelte-14nyow8">${escape_html(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed).toFixed(0))}°/s</div> <div style="font-size:11px;opacity:0.6;margin-top:4px;" class="svelte-14nyow8">Rotation Speed</div></div> <button class="speed-btn svelte-14nyow8">+</button></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div style="margin-top:12px;" class="svelte-14nyow8"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;" class="svelte-14nyow8"><div class="svelte-14nyow8"><strong class="svelte-14nyow8">Current Speed:</strong> ${escape_html(store_get($$store_subs ??= {}, "$rotationSpeed", rotationSpeed).toFixed(0))}°/s | <em style="font-size:12px;opacity:0.7;" class="svelte-14nyow8">(Touch: drag up to speed up, down to slow down)</em></div> <div style="display:flex;gap:6px;align-items:center;" class="svelte-14nyow8"><label for="manual-speed-input" style="font-size:12px;" class="svelte-14nyow8">Type speed:</label> <input id="manual-speed-input" type="number" min="1" step="1"${attr("value", manualSpeed)} style="width:100px;padding:6px;border-radius:4px;border:1px solid #ccc;" class="svelte-14nyow8"/> <button class="svelte-14nyow8">Set</button></div></div> <div class="svelte-14nyow8"><strong class="svelte-14nyow8">Detected count:</strong> ${escape_html(_detectedCount ?? 0)}</div> <div class="svelte-14nyow8"><strong class="svelte-14nyow8">Suggested speed:</strong> ${escape_html(_suggested ? _suggested.toFixed(0) : "—")}°/s</div> `);
    if (_detectedCircle) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="svelte-14nyow8"><strong class="svelte-14nyow8">Circle:</strong> x=${escape_html(Math.round(_detectedCircle.x))}, y=${escape_html(Math.round(_detectedCircle.y))}, r=${escape_html(Math.round(_detectedCircle.r))}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function SampleImageSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const samples = [
      { name: "Woman Chopping Tree", file: "WomanChoppingTree.jpg" },
      { name: "Dancing", file: "Dancing.jpg" },
      { name: "Jongleur", file: "Jongleur.png" },
      { name: "a_cheval", file: "a_cheval.png" },
      { name: "McLean_1", file: "McLean_1.png" },
      { name: "Gernamy_1949", file: "Gernamy_1949_R_Balzer.png" },
      {
        name: "AEO175939",
        file: "AEO175939_PhenakistoscopeGiroux60.jpg"
      },
      {
        name: "AEO185553",
        file: "AEO185553_PhenakistiscopeDisc_ManInBlueAndRed.jpg"
      },
      {
        name: "medium_1990_5036_3369",
        file: "medium_1990_5036_3369.jpg"
      },
      { name: "medium_a001813b", file: "medium_a001813b.jpg" },
      {
        name: "tumblr_obd6fh",
        file: "tumblr_obd6fhGFSZ1r9jbwno1_500.png"
      },
      {
        name: "tumblr_oc1cz",
        file: "tumblr_oc1czn99ZM1r9jbwno1_500.png"
      },
      {
        name: "Phantasmascope Faces",
        file: "Phantasmascope_faces.png"
      },
      {
        name: "722a6790240569.5e126845d9b56",
        file: "722a6790240569.5e126845d9b56.png"
      },
      {
        name: "Fantascope Disc 1833",
        file: "fantascope-disc-1833.png"
      }
    ];
    $$renderer2.push(`<div class="selector svelte-ai08gq"><label for="samples" class="svelte-ai08gq">Sample Images:</label> <select id="samples" class="svelte-ai08gq">`);
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`-- Choose a sample --`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(samples);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let sample = each_array[$$index];
      $$renderer2.option({ value: sample.file }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(sample.name)}`);
      });
    }
    $$renderer2.push(`<!--]--></select></div>`);
  });
}
function _page($$renderer) {
  $$renderer.push(`<div class="container svelte-1uha8ag"><h1 class="svelte-1uha8ag">Phenakistoscope Lab</h1> <p class="sub svelte-1uha8ag">Convert old phenakistoscope discs into animated GIFs</p> `);
  FileUploader($$renderer);
  $$renderer.push(`<!----> `);
  SampleImageSelector($$renderer);
  $$renderer.push(`<!----> `);
  ImagePreview($$renderer);
  $$renderer.push(`<!----> `);
  CanvasPlayer($$renderer);
  $$renderer.push(`<!----> `);
  AnalyzerPanel($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _page as default
};
