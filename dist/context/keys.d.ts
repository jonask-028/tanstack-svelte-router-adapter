/**
 * Router context key for Svelte's context API.
 * Used by RouterProvider to set and by hooks to get the router instance.
 */
export declare const ROUTER_CONTEXT_KEY = "tanstack-svelte-router";
/**
 * Match context key for tracking the current route match in Svelte's context API.
 * Used by Outlet to determine which child match to render.
 */
export declare const MATCH_CONTEXT_KEY = "tanstack-svelte-router-match";
/**
 * Reactive state getter context key.
 * Stores a function that returns the current router state as a Svelte $state value.
 * Components use this to reactively read router state without subscribing individually.
 */
export declare const ROUTER_STATE_KEY = "tanstack-svelte-router-state";
//# sourceMappingURL=keys.d.ts.map