import { getMatchContext, getRouterStateContext } from "../context/index.js";
/**
 * Get all route matches above (parent of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useParentMatches } from '@tanstack/svelte-router'
 *   let parents = $derived(useParentMatches())
 * </script>
 * ```
 */
export function useParentMatches(opts) {
    const getState = getRouterStateContext();
    const matchId = getMatchContext();
    const state = getState();
    const matches = state.matches;
    const currentIndex = matchId
        ? matches.findIndex((m) => m.id === matchId)
        : -1;
    const parentMatches = currentIndex > 0 ? matches.slice(0, currentIndex) : [];
    return opts?.select
        ? opts.select(parentMatches)
        : parentMatches;
}
