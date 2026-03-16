import { useRouter } from "./useRouter.js";
/**
 * Check if a route matches the current location.
 * Returns the matched params or false.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatchRoute } from '@tanstack/svelte-router'
 *   const matchRoute = useMatchRoute()
 *   const isActive = matchRoute({ to: '/orgs' })
 * </script>
 * ```
 */
export function useMatchRoute() {
    const router = useRouter();
    return (opts) => {
        const { pending, caseSensitive, fuzzy, ...navOpts } = opts;
        return router.matchRoute(navOpts, {
            pending,
            caseSensitive,
            fuzzy,
        });
    };
}
