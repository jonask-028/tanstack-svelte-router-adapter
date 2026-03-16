import { getMatchContext, getRouterStateContext } from "../context/index.js";
/**
 * Get the current route match data.
 *
 * By default, throws if the match is not found (strict mode).
 * Pass `shouldThrow: false` to return `undefined` instead.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatch } from '@tanstack/svelte-router'
 *   let match = $derived(useMatch({ from: '/orgs/$id' }))
 * </script>
 * ```
 */
export function useMatch(opts) {
    // Read from the reactive $state getter for Svelte 5 reactivity
    const getState = getRouterStateContext();
    const matchId = getMatchContext();
    const state = getState();
    const match = state.matches.find((m) => {
        if (opts?.from)
            return m.routeId === opts.from;
        if (matchId)
            return m.id === matchId;
        return false;
    });
    // Throw if match not found and shouldThrow is true (default)
    const shouldThrow = opts?.shouldThrow ?? true;
    if (shouldThrow && !match) {
        throw new Error(opts?.from
            ? `Could not find an active match from "${opts.from}"`
            : "Could not find a nearest match!");
    }
    if (match === undefined) {
        return undefined;
    }
    return opts?.select ? opts.select(match) : match;
}
