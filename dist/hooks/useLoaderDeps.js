import { useMatch } from "./useMatch.js";
/**
 * Get the loader deps for the current route match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useLoaderDeps } from '@tanstack/svelte-router'
 *   const deps = useLoaderDeps({ from: '/orgs' })
 * </script>
 * ```
 */
export function useLoaderDeps(opts) {
    return useMatch({
        ...opts,
        select: (match) => {
            const loaderDeps = match?.loaderDeps ?? {};
            return opts?.select ? opts.select(loaderDeps) : loaderDeps;
        },
    });
}
