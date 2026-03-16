import { useMatch } from "./useMatch.js";
/**
 * Get the route context for the current route match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useRouteContext } from '@tanstack/svelte-router'
 *   const context = useRouteContext({ from: '/orgs/$id' })
 * </script>
 * ```
 */
export function useRouteContext(opts) {
    return useMatch({
        ...opts,
        select: (match) => {
            const context = match?.context ?? {};
            return opts?.select ? opts.select(context) : context;
        },
    });
}
