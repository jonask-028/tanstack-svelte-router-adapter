import { getMatchContext, getRouterStateContext } from "../context/index.js";
import type {
  AnyRouter,
  AnyRouteMatch,
  RegisteredRouter,
} from "@tanstack/router-core";

/**
 * Get all route matches above (parent of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useParentMatches } from '@tanstack/svelte-router'
 *   let parents = $derived(useParentMatches())
 * </script>
 * ```
 */
export function useParentMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = Array<AnyRouteMatch>,
>(opts?: { select?: (matches: Array<AnyRouteMatch>) => TSelected }): TSelected {
  const getState = getRouterStateContext();
  const matchId = getMatchContext();

  const state = getState();
  const matches = state.matches as Array<AnyRouteMatch>;
  const currentIndex = matchId
    ? matches.findIndex((m: any) => m.id === matchId)
    : -1;

  const parentMatches = currentIndex > 0 ? matches.slice(0, currentIndex) : [];

  return opts?.select
    ? opts.select(parentMatches)
    : (parentMatches as TSelected);
}
