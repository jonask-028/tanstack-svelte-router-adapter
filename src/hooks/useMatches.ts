import { getRouterStateContext } from "../context/index.js";
import type {
  AnyRouter,
  AnyRouteMatch,
  RegisteredRouter,
} from "@tanstack/router-core";

/**
 * Get all current route matches.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useMatches } from '@tanstack/svelte-router'
 *   let matches = $derived(useMatches())
 * </script>
 * ```
 */
export function useMatches<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = Array<AnyRouteMatch>,
>(opts?: { select?: (matches: Array<AnyRouteMatch>) => TSelected }): TSelected {
  const getState = getRouterStateContext();
  const state = getState();
  const matches = state.matches as Array<AnyRouteMatch>;
  return opts?.select ? opts.select(matches) : (matches as TSelected);
}
