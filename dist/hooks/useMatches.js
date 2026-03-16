import { getRouterStateContext } from "../context/index.js";
/**
 * Get all current route matches.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatches } from '@tanstack/svelte-router'
 *   let matches = $derived(useMatches())
 * </script>
 * ```
 */
export function useMatches(opts) {
    const getState = getRouterStateContext();
    const state = getState();
    const matches = state.matches;
    return opts?.select ? opts.select(matches) : matches;
}
