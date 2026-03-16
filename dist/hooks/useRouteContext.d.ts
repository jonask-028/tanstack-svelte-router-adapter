import type { AnyRouter, RegisteredRouter, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useRouteContext<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TSelected = unknown>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (context: any) => TSelected;
}): TSelected;
//# sourceMappingURL=useRouteContext.d.ts.map