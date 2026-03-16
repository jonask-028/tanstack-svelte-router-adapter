import type { AnyRouter, RegisteredRouter, RouteById, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useSearch<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TSelected = TStrict extends true ? RouteById<TRouter["routeTree"], TFrom>["types"]["fullSearchSchema"] : Record<string, unknown>>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (search: Record<string, unknown>) => TSelected;
}): TSelected;
//# sourceMappingURL=useSearch.d.ts.map