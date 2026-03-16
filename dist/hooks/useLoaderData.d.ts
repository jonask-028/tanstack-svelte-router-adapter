import type { AnyRouter, RegisteredRouter, RouteById, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useLoaderData<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TSelected = TStrict extends true ? RouteById<TRouter["routeTree"], TFrom>["types"]["loaderData"] : unknown>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (data: any) => TSelected;
}): TSelected;
//# sourceMappingURL=useLoaderData.d.ts.map