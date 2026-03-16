import type { AnyRouter, RegisteredRouter, RouteById, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useLoaderDeps<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TSelected = TStrict extends true ? RouteById<TRouter["routeTree"], TFrom>["types"]["loaderDeps"] : Record<string, any>>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (deps: any) => TSelected;
}): TSelected;
//# sourceMappingURL=useLoaderDeps.d.ts.map