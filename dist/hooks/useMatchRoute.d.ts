import type { AnyRouter, RegisteredRouter, RoutePaths, NavigateOptions } from "@tanstack/router-core";
export type MatchRouteOptions<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RoutePaths<TRouter["routeTree"]> | string = string, TTo extends string = ""> = NavigateOptions<TRouter, TFrom, TTo> & {
    pending?: boolean;
    caseSensitive?: boolean;
    fuzzy?: boolean;
};
/**
 * Check if a route matches the current location.
 * Returns the matched params or false.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatchRoute } from '@tanstack/svelte-router'
 *   const matchRoute = useMatchRoute()
 *   const isActive = matchRoute({ to: '/orgs' })
 * </script>
 * ```
 */
export declare function useMatchRoute<TRouter extends AnyRouter = RegisteredRouter>(): <TFrom extends RoutePaths<TRouter["routeTree"]> | string = string, TTo extends string = "">(opts: MatchRouteOptions<TRouter, TFrom, TTo>) => false | Record<string, string>;
//# sourceMappingURL=useMatchRoute.d.ts.map