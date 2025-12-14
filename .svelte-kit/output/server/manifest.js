export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "phenaki-lab/_app",
	assets: new Set([".nojekyll","favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.vM72HLsj.js",app:"_app/immutable/entry/app.BAn2ZH3d.js",imports:["_app/immutable/entry/start.vM72HLsj.js","_app/immutable/chunks/CJUu3BJm.js","_app/immutable/chunks/BmgSzj6w.js","_app/immutable/chunks/B3QUX6bn.js","_app/immutable/entry/app.BAn2ZH3d.js","_app/immutable/chunks/BmgSzj6w.js","_app/immutable/chunks/hAALANAn.js","_app/immutable/chunks/C2OulXxV.js","_app/immutable/chunks/B3QUX6bn.js","_app/immutable/chunks/Bv2EIizG.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/phenaki-lab/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
