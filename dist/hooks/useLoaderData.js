import { useMatch } from "./useMatch.js";
/**
 * Get the loader data for the current route match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useLoaderData } from '@tanstack/svelte-router'
 *   const data = useLoaderData({ from: '/orgs' })
 * </script>
 * ```
 */
export function useLoaderData(opts) {
    return useMatch({
        ...opts,
        select: (match) => {
            const loaderData = match?.loaderData;
            return opts?.select ? opts.select(loaderData) : loaderData;
        },
    });
}
