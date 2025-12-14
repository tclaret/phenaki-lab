

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.CjOV8mfr.js","_app/immutable/chunks/DidSmI2s.js","_app/immutable/chunks/CkcJ_p-v.js","_app/immutable/chunks/BfDn8e9k.js"];
export const stylesheets = ["_app/immutable/assets/0.FMF-WCKT.css"];
export const fonts = [];
