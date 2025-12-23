export default AnalyzerPanel;
type AnalyzerPanel = SvelteComponent<{
    [x: string]: never;
}, {
    touchstart: TouchEvent;
    touchend: TouchEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> & {
    $$bindings?: string | undefined;
};
declare const AnalyzerPanel: $$__sveltets_2_IsomorphicComponent<{
    [x: string]: never;
}, {
    touchstart: TouchEvent;
    touchend: TouchEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import("svelte").ComponentConstructorOptions<Props>): import("svelte").SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
