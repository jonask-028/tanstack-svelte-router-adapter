import { getContext } from "svelte";
import { ROUTER_CONTEXT_KEY, MATCH_CONTEXT_KEY, ROUTER_STATE_KEY, } from "./keys.js";
/**
 * Get the router instance from Svelte context.
 * Must be called within a component that is a descendant of RouterProvider.
 */
export function getRouterContext() {
    return getContext(ROUTER_CONTEXT_KEY);
}
/**
 * Get the current match ID from Svelte context.
 * The match context is stored as a getter function for reactivity.
 * Used internally by Outlet to track match hierarchy.
 */
export function getMatchContext() {
    const getter = getContext(MATCH_CONTEXT_KEY);
    return typeof getter === "function" ? getter() : undefined;
}
/**
 * Get the reactive router state getter from Svelte context.
 * Returns a function that, when called inside $derived or $effect,
 * creates a reactive dependency on the router state.
 */
export function getRouterStateContext() {
    return getContext(ROUTER_STATE_KEY);
}
