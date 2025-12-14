

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.nfjrJzhb.js","_app/immutable/chunks/C2OulXxV.js","_app/immutable/chunks/BmgSzj6w.js","_app/immutable/chunks/u-GhMVP5.js"];
export const stylesheets = ["_app/immutable/assets/0.CV0BMypH.css"];
export const fonts = [];
