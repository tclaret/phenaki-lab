

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "prerender": true,
  "ssr": false
};
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.D8ticmnS.js","_app/immutable/chunks/BPwTt6vP.js","_app/immutable/chunks/zw_chER5.js","_app/immutable/chunks/D4mQYNIE.js"];
export const stylesheets = ["_app/immutable/assets/0.CV0BMypH.css"];
export const fonts = [];
