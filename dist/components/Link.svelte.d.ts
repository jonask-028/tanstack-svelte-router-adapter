import type { Snippet } from "svelte";
type $$ComponentProps = {
    to: string;
    from?: string;
    params?: Record<string, string>;
    search?: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>);
    hash?: string | ((prev: string) => string);
    state?: Record<string, unknown>;
    mask?: {
        to?: string;
        from?: string;
        params?: Record<string, string>;
        search?: Record<string, unknown>;
        hash?: string;
        state?: Record<string, unknown>;
        unmaskOnReload?: boolean;
    };
    replace?: boolean;
    resetScroll?: boolean;
    viewTransition?: boolean;
    startTransition?: boolean;
    hashScrollIntoView?: boolean | ScrollIntoViewOptions;
    ignoreBlocker?: boolean;
    reloadDocument?: boolean;
    preload?: "intent" | "render" | "viewport" | false;
    preloadDelay?: number;
    activeProps?: Record<string, any> | (() => Record<string, any>);
    inactiveProps?: Record<string, any> | (() => Record<string, any>);
    activeOptions?: {
        exact?: boolean;
        includeSearch?: boolean;
        includeHash?: boolean;
    };
    target?: string;
    disabled?: boolean;
    children?: Snippet<[{
        isActive: boolean;
        isTransitioning: boolean;
    }]>;
    class?: string;
    style?: string | Record<string, string>;
    onclick?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
    onfocus?: (e: FocusEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    [key: string]: any;
};
declare const Link: import("svelte").Component<$$ComponentProps, {}, "">;
type Link = ReturnType<typeof Link>;
export default Link;
//# sourceMappingURL=Link.svelte.d.ts.map