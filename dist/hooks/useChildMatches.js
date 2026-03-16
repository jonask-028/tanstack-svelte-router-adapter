import { getMatchContext, getRouterStateContext } from "../context/index.js";
/**
 * Get all route matches below (children of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useChildMatches } from '@tanstack/svelte-router'
 *   let children = $derived(useChildMatches())
 * </script>
 * ```
 */
export function useChildMatches(opts) {
    const getState = getRouterStateContext();
    const matchId = getMatchContext();
    const state = getState();
    const matches = state.matches;
    const currentIndex = matchId
        ? matches.findIndex((m) => m.id === matchId)
        : -1;
    const childMatches = currentIndex >= 0 ? matches.slice(currentIndex + 1) : [];
    return opts?.select ? opts.select(childMatches) : childMatches;
}
