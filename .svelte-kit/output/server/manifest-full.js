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
		client: {start:"_app/immutable/entry/start.JPFip3py.js",app:"_app/immutable/entry/app.D4fvq0sA.js",imports:["_app/immutable/entry/start.JPFip3py.js","_app/immutable/chunks/Bkuaavg7.js","_app/immutable/chunks/zw_chER5.js","_app/immutable/chunks/BQFw1Q7y.js","_app/immutable/entry/app.D4fvq0sA.js","_app/immutable/chunks/zw_chER5.js","_app/immutable/chunks/CfBDm7bY.js","_app/immutable/chunks/BPwTt6vP.js","_app/immutable/chunks/BQFw1Q7y.js","_app/immutable/chunks/BuQu0Dv8.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
