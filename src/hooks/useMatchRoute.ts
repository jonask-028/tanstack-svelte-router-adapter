import { useRouter } from "./useRouter.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RoutePaths,
  NavigateOptions,
} from "@tanstack/router-core";

export type MatchRouteOptions<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RoutePaths<TRouter["routeTree"]> | string = string,
  TTo extends string = "",
> = NavigateOptions<TRouter, TFrom, TTo> & {
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
export function useMatchRoute<TRouter extends AnyRouter = RegisteredRouter>() {
  const router = useRouter<TRouter>();

  return <
    TFrom extends RoutePaths<TRouter["routeTree"]> | string = string,
    TTo extends string = "",
  >(
    opts: MatchRouteOptions<TRouter, TFrom, TTo>,
  ): false | Record<string, string> => {
    const { pending, caseSensitive, fuzzy, ...navOpts } = opts;
    return router.matchRoute(navOpts as any, {
      pending,
      caseSensitive,
      fuzzy,
    }) as any;
  };
}
