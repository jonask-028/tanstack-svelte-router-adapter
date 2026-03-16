import { getMatchContext, getRouterStateContext } from "../context/index.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RouteById,
  RouteIds,
  StrictOrFrom,
} from "@tanstack/router-core";

/**
 * Get the current route match data.
 *
 * By default, throws if the match is not found (strict mode).
 * Pass `shouldThrow: false` to return `undefined` instead.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatch } from '@tanstack/svelte-router'
 *   let match = $derived(useMatch({ from: '/orgs/$id' }))
 * </script>
 * ```
 */
export function useMatch<
  TRouter extends AnyRouter = RegisteredRouter,
  TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>,
  TStrict extends boolean = true,
  TThrow extends boolean = true,
  TSelected = RouteById<TRouter["routeTree"], TFrom>,
>(
  opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (match: any) => TSelected;
    shouldThrow?: TThrow;
  },
): TSelected {
  // Read from the reactive $state getter for Svelte 5 reactivity
  const getState = getRouterStateContext();
  const matchId = getMatchContext();

  const state = getState();
  const match = state.matches.find((m: any) => {
    if (opts?.from) return m.routeId === opts.from;
    if (matchId) return m.id === matchId;
    return false;
  });

  // Throw if match not found and shouldThrow is true (default)
  const shouldThrow = opts?.shouldThrow ?? true;
  if (shouldThrow && !match) {
    throw new Error(
      opts?.from
        ? `Could not find an active match from "${opts.from}"`
        : "Could not find a nearest match!",
    );
  }

  if (match === undefined) {
    return undefined as TSelected;
  }

  return opts?.select ? opts.select(match) : (match as TSelected);
}
