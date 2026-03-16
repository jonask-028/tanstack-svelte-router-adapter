import { useRouterState } from "./useRouterState.js";
/**
 * Get the current parsed location.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useLocation } from '@tanstack/svelte-router'
 *   let location = $derived(useLocation())
 *   // location.pathname, location.search, location.hash
 * </script>
 * ```
 */
export function useLocation() {
    return useRouterState({
        select: (state) => state.location,
    });
}
