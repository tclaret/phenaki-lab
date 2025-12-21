
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const IMSETTINGS_INTEGRATE_DESKTOP: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const COLORTERM: string;
	export const XDG_CONFIG_DIRS: string;
	export const LESS: string;
	export const HISTCONTROL: string;
	export const XDG_MENU_PREFIX: string;
	export const TERM_PROGRAM_VERSION: string;
	export const npm_config_npm_globalconfig: string;
	export const PTYXIS_PROFILE: string;
	export const HISTSIZE: string;
	export const HOSTNAME: string;
	export const ICEAUTHORITY: string;
	export const LANGUAGE: string;
	export const NODE: string;
	export const LC_ADDRESS: string;
	export const GUESTFISH_OUTPUT: string;
	export const LC_NAME: string;
	export const SSH_AUTH_SOCK: string;
	export const XDG_DATA_HOME: string;
	export const npm_config_verify_deps_before_run: string;
	export const HISTTIMEFORMAT: string;
	export const npm_config__jsr_registry: string;
	export const DRI_PRIME: string;
	export const XDG_CONFIG_HOME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const XMODIFIERS: string;
	export const LIBVA_DRIVER_NAME: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const GTK_RC_FILES: string;
	export const NO_AT_BRIDGE: string;
	export const GDK_CORE_DEVICE_EVENTS: string;
	export const npm_config_globalconfig: string;
	export const GPG_TTY: string;
	export const EDITOR: string;
	export const WASMEDGE_LIB_DIR: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LOGNAME: string;
	export const XDG_SESSION_TYPE: string;
	export const MODULESHOME: string;
	export const MANPATH: string;
	export const SYSTEMD_EXEC_PID: string;
	export const QT_AUTO_SCREEN_SCAL_FACTOR: string;
	export const XAUTHORITY: string;
	export const VSCODE_GIT_ASKPASS_NODE: string;
	export const GUESTFISH_RESTORE: string;
	export const GDM_LANG: string;
	export const GTK2_RC_FILES: string;
	export const __MODULES_SHARE_MANPATH: string;
	export const HOME: string;
	export const USERNAME: string;
	export const SSH_ASKPASS: string;
	export const LC_PAPER: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_version: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const VTE_VERSION: string;
	export const WAYLAND_DISPLAY: string;
	export const GUESTFISH_PS1: string;
	export const GIT_ASKPASS: string;
	export const PERL5LIB: string;
	export const INVOCATION_ID: string;
	export const pnpm_config_verify_deps_before_run: string;
	export const MANAGERPID: string;
	export const IMSETTINGS_MODULE: string;
	export const INIT_CWD: string;
	export const CHROME_DESKTOP: string;
	export const KDE_SESSION_UID: string;
	export const XDG_CACHE_HOME: string;
	export const npm_lifecycle_script: string;
	export const MOZ_GMP_PATH: string;
	export const VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
	export const XKB_DEFAULT_LAYOUT: string;
	export const VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
	export const KWIN_DRM_USE_EGL_STREAMS: string;
	export const XDG_SESSION_CLASS: string;
	export const TERM: string;
	export const npm_package_name: string;
	export const CPLUS_INCLUDE_PATH: string;
	export const PERL_MB_OPT: string;
	export const GTK_SCALE: string;
	export const LESSOPEN: string;
	export const USER: string;
	export const npm_config_frozen_lockfile: string;
	export const GIT_PAGER: string;
	export const LIBRARY_PATH: string;
	export const VSCODE_GIT_IPC_HANDLE: string;
	export const MODULES_RUN_QUARANTINE: string;
	export const QT_WAYLAND_RECONNECT: string;
	export const KDE_SESSION_VERSION: string;
	export const LOADEDMODULES: string;
	export const PERL_MM_OPT: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const LC_TELEPHONE: string;
	export const GUESTFISH_INIT: string;
	export const QT_IM_MODULE: string;
	export const CVS_RSH: string;
	export const LC_MEASUREMENT: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const PNPM_SCRIPT_SRC_DIR: string;
	export const XDG_STATE_HOME: string;
	export const npm_execpath: string;
	export const FC_FONTATIONS: string;
	export const LD_LIBRARY_PATH: string;
	export const QT_SCALE_FACTOR_ROUNDING_POLICY: string;
	export const XDG_RUNTIME_DIR: string;
	export const NODE_PATH: string;
	export const __MODULES_LMINIT: string;
	export const DEBUGINFOD_URLS: string;
	export const DOCKER_HOST: string;
	export const LC_TIME: string;
	export const npm_package_json: string;
	export const BUN_INSTALL: string;
	export const DEBUGINFOD_IMA_CERT_PATH: string;
	export const KDEDIRS: string;
	export const VSCODE_GIT_ASKPASS_MAIN: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const JOURNAL_STREAM: string;
	export const XDG_DATA_DIRS: string;
	export const PERL_LOCAL_LIB_ROOT: string;
	export const GDK_BACKEND: string;
	export const KDE_FULL_SESSION: string;
	export const PATH: string;
	export const __GLX_VENDOR_LIBRARY_NAME: string;
	export const GDK_SCALE: string;
	export const npm_config_node_gyp: string;
	export const MODULEPATH: string;
	export const GDMSESSION: string;
	export const GBM_BACKEND: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const C_INCLUDE_PATH: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const MAIL: string;
	export const npm_config_registry: string;
	export const PTYXIS_VERSION: string;
	export const WASMER_CACHE_DIR: string;
	export const QT_SCALE_FACTOR: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const FLATPAK_TTY_PROGRESS: string;
	export const LC_NUMERIC: string;
	export const WASMER_DIR: string;
	export const GOPATH: string;
	export const MODULES_CMD: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
	export const PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		IMSETTINGS_INTEGRATE_DESKTOP: string;
		npm_command: string;
		SESSION_MANAGER: string;
		COLORTERM: string;
		XDG_CONFIG_DIRS: string;
		LESS: string;
		HISTCONTROL: string;
		XDG_MENU_PREFIX: string;
		TERM_PROGRAM_VERSION: string;
		npm_config_npm_globalconfig: string;
		PTYXIS_PROFILE: string;
		HISTSIZE: string;
		HOSTNAME: string;
		ICEAUTHORITY: string;
		LANGUAGE: string;
		NODE: string;
		LC_ADDRESS: string;
		GUESTFISH_OUTPUT: string;
		LC_NAME: string;
		SSH_AUTH_SOCK: string;
		XDG_DATA_HOME: string;
		npm_config_verify_deps_before_run: string;
		HISTTIMEFORMAT: string;
		npm_config__jsr_registry: string;
		DRI_PRIME: string;
		XDG_CONFIG_HOME: string;
		MEMORY_PRESSURE_WRITE: string;
		XMODIFIERS: string;
		LIBVA_DRIVER_NAME: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		GTK_RC_FILES: string;
		NO_AT_BRIDGE: string;
		GDK_CORE_DEVICE_EVENTS: string;
		npm_config_globalconfig: string;
		GPG_TTY: string;
		EDITOR: string;
		WASMEDGE_LIB_DIR: string;
		XDG_SEAT: string;
		PWD: string;
		XDG_SESSION_DESKTOP: string;
		LOGNAME: string;
		XDG_SESSION_TYPE: string;
		MODULESHOME: string;
		MANPATH: string;
		SYSTEMD_EXEC_PID: string;
		QT_AUTO_SCREEN_SCAL_FACTOR: string;
		XAUTHORITY: string;
		VSCODE_GIT_ASKPASS_NODE: string;
		GUESTFISH_RESTORE: string;
		GDM_LANG: string;
		GTK2_RC_FILES: string;
		__MODULES_SHARE_MANPATH: string;
		HOME: string;
		USERNAME: string;
		SSH_ASKPASS: string;
		LC_PAPER: string;
		LANG: string;
		LS_COLORS: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_version: string;
		MEMORY_PRESSURE_WATCH: string;
		VTE_VERSION: string;
		WAYLAND_DISPLAY: string;
		GUESTFISH_PS1: string;
		GIT_ASKPASS: string;
		PERL5LIB: string;
		INVOCATION_ID: string;
		pnpm_config_verify_deps_before_run: string;
		MANAGERPID: string;
		IMSETTINGS_MODULE: string;
		INIT_CWD: string;
		CHROME_DESKTOP: string;
		KDE_SESSION_UID: string;
		XDG_CACHE_HOME: string;
		npm_lifecycle_script: string;
		MOZ_GMP_PATH: string;
		VSCODE_GIT_ASKPASS_EXTRA_ARGS: string;
		XKB_DEFAULT_LAYOUT: string;
		VSCODE_PYTHON_AUTOACTIVATE_GUARD: string;
		KWIN_DRM_USE_EGL_STREAMS: string;
		XDG_SESSION_CLASS: string;
		TERM: string;
		npm_package_name: string;
		CPLUS_INCLUDE_PATH: string;
		PERL_MB_OPT: string;
		GTK_SCALE: string;
		LESSOPEN: string;
		USER: string;
		npm_config_frozen_lockfile: string;
		GIT_PAGER: string;
		LIBRARY_PATH: string;
		VSCODE_GIT_IPC_HANDLE: string;
		MODULES_RUN_QUARANTINE: string;
		QT_WAYLAND_RECONNECT: string;
		KDE_SESSION_VERSION: string;
		LOADEDMODULES: string;
		PERL_MM_OPT: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		LC_TELEPHONE: string;
		GUESTFISH_INIT: string;
		QT_IM_MODULE: string;
		CVS_RSH: string;
		LC_MEASUREMENT: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		PNPM_SCRIPT_SRC_DIR: string;
		XDG_STATE_HOME: string;
		npm_execpath: string;
		FC_FONTATIONS: string;
		LD_LIBRARY_PATH: string;
		QT_SCALE_FACTOR_ROUNDING_POLICY: string;
		XDG_RUNTIME_DIR: string;
		NODE_PATH: string;
		__MODULES_LMINIT: string;
		DEBUGINFOD_URLS: string;
		DOCKER_HOST: string;
		LC_TIME: string;
		npm_package_json: string;
		BUN_INSTALL: string;
		DEBUGINFOD_IMA_CERT_PATH: string;
		KDEDIRS: string;
		VSCODE_GIT_ASKPASS_MAIN: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		JOURNAL_STREAM: string;
		XDG_DATA_DIRS: string;
		PERL_LOCAL_LIB_ROOT: string;
		GDK_BACKEND: string;
		KDE_FULL_SESSION: string;
		PATH: string;
		__GLX_VENDOR_LIBRARY_NAME: string;
		GDK_SCALE: string;
		npm_config_node_gyp: string;
		MODULEPATH: string;
		GDMSESSION: string;
		GBM_BACKEND: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		C_INCLUDE_PATH: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		MAIL: string;
		npm_config_registry: string;
		PTYXIS_VERSION: string;
		WASMER_CACHE_DIR: string;
		QT_SCALE_FACTOR: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		FLATPAK_TTY_PROGRESS: string;
		LC_NUMERIC: string;
		WASMER_DIR: string;
		GOPATH: string;
		MODULES_CMD: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
