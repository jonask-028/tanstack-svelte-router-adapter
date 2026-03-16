import type { AnyRouter, RegisteredRouter, RouteById, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useParams<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TSelected = TStrict extends true ? RouteById<TRouter["routeTree"], TFrom>["types"]["allParams"] : Record<string, string>>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (params: Record<string, string>) => TSelected;
}): TSelected;
//# sourceMappingURL=useParams.d.ts.map