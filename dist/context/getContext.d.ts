import type { AnyRouter, RouterState } from "@tanstack/router-core";
/**
 * Get the router instance from Svelte context.
 * Must be called within a component that is a descendant of RouterProvider.
 */
export declare function getRouterContext<TRouter extends AnyRouter = AnyRouter>(): TRouter;
/**
 * Get the current match ID from Svelte context.
 * The match context is stored as a getter function for reactivity.
 * Used internally by Outlet to track match hierarchy.
 */
export declare function getMatchContext(): string | undefined;
/**
 * Get the reactive router state getter from Svelte context.
 * Returns a function that, when called inside $derived or $effect,
 * creates a reactive dependency on the router state.
 */
export declare function getRouterStateContext(): () => RouterState<any>;
//# sourceMappingURL=getContext.d.ts.map