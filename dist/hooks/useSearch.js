import { useMatch } from "./useMatch.js";
/**
 * Get the current route's search params.
 *
 * When `from` is specified, returns the validated search params for that
 * specific route (using the route's `validateSearch` schema). Without `from`,
 * falls back to the current match's search params.
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
    // Delegate to useMatch to get route-scoped validated search params,
    // consistent with how useParams works.
    return useMatch({
        ...opts,
        select: (match) => {
            const search = match?.search ?? {};
            return opts?.select ? opts.select(search) : search;
        },
    });
}
