import { useMatch } from "./useMatch.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RouteIds,
  StrictOrFrom,
} from "@tanstack/router-core";

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
export function useRouteContext<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>,
  TStrict extends boolean = true,
  TSelected = unknown,
>(
  opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (context: any) => TSelected;
  },
): TSelected {
  return useMatch({
    ...(opts as any),
    select: (match: any) => {
      const context = match?.context ?? {};
      return opts?.select ? opts.select(context) : context;
    },
  }) as TSelected;
}
