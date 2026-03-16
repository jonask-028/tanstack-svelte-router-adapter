import { useMatch } from "./useMatch.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RouteById,
  RouteIds,
  StrictOrFrom,
} from "@tanstack/router-core";

/**
 * Get the current route's search params.
 *
 * When `from` is specified, returns the validated search params for that
 * specific route (using the route's `validateSearch` schema). Without `from`,
 * falls back to the current match's search params.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useSearch } from '@tanstack/svelte-router'
 *   const search = useSearch({ from: '/orgs' })
 * </script>
 * ```
 */
export function useSearch<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>,
  TStrict extends boolean = true,
  TSelected = TStrict extends true
    ? RouteById<TRouter["routeTree"], TFrom>["types"]["fullSearchSchema"]
    : Record<string, unknown>,
>(
  opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (search: Record<string, unknown>) => TSelected;
  },
): TSelected {
  // Delegate to useMatch to get route-scoped validated search params,
  // consistent with how useParams works.
  return useMatch({
    ...(opts as any),
    select: (match: any) => {
      const search = match?.search ?? {};
      return opts?.select ? opts.select(search) : search;
    },
  }) as TSelected;
}
