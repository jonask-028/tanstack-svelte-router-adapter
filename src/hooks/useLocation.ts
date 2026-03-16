import { useRouterState } from "./useRouterState.js";
import type {
  AnyRouter,
  RegisteredRouter,
  ParsedLocation,
} from "@tanstack/router-core";

/**
 * Get the current parsed location.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useLocation } from '@tanstack/svelte-router'
 *   let location = $derived(useLocation())
 *   // location.pathname, location.search, location.hash
 * </script>
 * ```
 */
export function useLocation<
  TRouter extends AnyRouter = RegisteredRouter,
>(): ParsedLocation {
  return useRouterState<TRouter, ParsedLocation>({
    select: (state) => state.location as ParsedLocation,
  });
}
