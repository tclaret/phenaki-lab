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
		client: {start:"_app/immutable/entry/start.Be93krlL.js",app:"_app/immutable/entry/app.C_4Gy9rO.js",imports:["_app/immutable/entry/start.Be93krlL.js","_app/immutable/chunks/D_zPzwNO.js","_app/immutable/chunks/CkcJ_p-v.js","_app/immutable/chunks/BzLubvRb.js","_app/immutable/entry/app.C_4Gy9rO.js","_app/immutable/chunks/CkcJ_p-v.js","_app/immutable/chunks/EstrOUTn.js","_app/immutable/chunks/DidSmI2s.js","_app/immutable/chunks/BzLubvRb.js","_app/immutable/chunks/CgM4jgzu.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
