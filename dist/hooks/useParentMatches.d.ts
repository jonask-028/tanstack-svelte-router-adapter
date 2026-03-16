import type { AnyRouter, AnyRouteMatch, RegisteredRouter } from "@tanstack/router-core";
/**
 * Get all route matches above (parent of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useParentMatches } from '@tanstack/svelte-router'
 *   let parents = $derived(useParentMatches())
 * </script>
 * ```
 */
export declare function useParentMatches<TRouter extends AnyRouter = RegisteredRouter, TSelected = Array<AnyRouteMatch>>(opts?: {
    select?: (matches: Array<AnyRouteMatch>) => TSelected;
}): TSelected;
//# sourceMappingURL=useParentMatches.d.ts.map