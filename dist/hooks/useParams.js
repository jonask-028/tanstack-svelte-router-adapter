import { useMatch } from "./useMatch.js";
/**
 * Get the current route parameters.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useParams } from '@tanstack/svelte-router'
 *   // Strict mode - specify the route
 *   let params = $derived(useParams({ from: '/orgs/$id' }))
 *   // params.id is typed
 *
 *   // Loose mode - all params merged
 *   let allParams = $derived(useParams({ strict: false }))
 * </script>
 * ```
 */
export function useParams(opts) {
    // Delegate to useMatch which correctly finds the match by route id
    // or match context, instead of blindly using .at(-1)
    return useMatch({
        ...opts,
        select: (match) => {
            const params = match?.params ?? {};
            return opts?.select ? opts.select(params) : params;
        },
    });
}
