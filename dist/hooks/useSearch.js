import { useRouterState } from "./useRouterState.js";
/**
 * Get the current route's search params.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useSearch } from '@tanstack/svelte-router'
 *   const search = useSearch({ from: '/orgs' })
 * </script>
 * ```
 */
export function useSearch(opts) {
    return useRouterState({
        select: (state) => {
            const search = state.location?.search ?? {};
            return opts?.select ? opts.select(search) : search;
        },
    });
}
