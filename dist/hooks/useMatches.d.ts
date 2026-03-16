import type { AnyRouter, AnyRouteMatch, RegisteredRouter } from "@tanstack/router-core";
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
export declare function useMatches<TRouter extends AnyRouter = RegisteredRouter, TSelected = Array<AnyRouteMatch>>(opts?: {
    select?: (matches: Array<AnyRouteMatch>) => TSelected;
}): TSelected;
//# sourceMappingURL=useMatches.d.ts.map