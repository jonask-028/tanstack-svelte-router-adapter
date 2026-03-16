import { useMatch } from "./useMatch.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RouteById,
  RoutePaths,
  RouteIds,
  StrictOrFrom,
} from "@tanstack/router-core";

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
export function useParams<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>,
  TStrict extends boolean = true,
  TSelected = TStrict extends true
    ? RouteById<TRouter["routeTree"], TFrom>["types"]["allParams"]
    : Record<string, string>,
>(
  opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (params: Record<string, string>) => TSelected;
  },
): TSelected {
  // Delegate to useMatch which correctly finds the match by route id
  // or match context, instead of blindly using .at(-1)
  return useMatch({
    ...(opts as any),
    select: (match: any) => {
      const params = match?.params ?? {};
      return opts?.select ? opts.select(params) : params;
    },
  }) as TSelected;
}
