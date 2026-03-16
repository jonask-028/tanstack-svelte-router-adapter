import { getMatchContext, getRouterStateContext } from "../context/index.js";
/**
 * Get the current route match data.
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
    return opts?.select ? opts.select(match) : match;
}
