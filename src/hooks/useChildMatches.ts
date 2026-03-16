import { getMatchContext, getRouterStateContext } from "../context/index.js";
import type {
  AnyRouter,
  AnyRouteMatch,
  RegisteredRouter,
} from "@tanstack/router-core";

/**
 * Get all route matches below (children of) the current match.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useChildMatches } from '@tanstack/svelte-router'
 *   let children = $derived(useChildMatches())
 * </script>
 * ```
 */
export function useChildMatches<
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

  const childMatches = currentIndex >= 0 ? matches.slice(currentIndex + 1) : [];

  return opts?.select ? opts.select(childMatches) : (childMatches as TSelected);
}
