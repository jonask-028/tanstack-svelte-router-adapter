import type { AnyRouter, AnyRouteMatch, RegisteredRouter } from "@tanstack/router-core";
/**
 * Get all route matches below (children of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useChildMatches } from '@tanstack/svelte-router'
 *   let children = $derived(useChildMatches())
 * </script>
 * ```
 */
export declare function useChildMatches<TRouter extends AnyRouter = RegisteredRouter, TSelected = Array<AnyRouteMatch>>(opts?: {
    select?: (matches: Array<AnyRouteMatch>) => TSelected;
}): TSelected;
//# sourceMappingURL=useChildMatches.d.ts.map