import { useRouter } from "./useRouter.js";
import { getRouterStateContext } from "../context/index.js";
import type {
  AnyRouter,
  RegisteredRouter,
  RouterState,
} from "@tanstack/router-core";

/**
 * Subscribe to router state changes reactively.
 * Uses a selector to pick specific state to avoid unnecessary re-renders.
 *
 * **Important**: Wrap the call in `$derived()` for Svelte 5 reactivity:
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useRouterState } from '@tanstack/svelte-router'
 *   // Reactive — updates when location changes
 *   let location = $derived(useRouterState({ select: (s) => s.location }))
 * </script>
 * ```
 */
export function useRouterState<
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = RouterState<TRouter["routeTree"]>,
>(opts?: {
  router?: TRouter;
  select?: (state: RouterState<TRouter["routeTree"]>) => TSelected;
}): TSelected {
  // Read from the reactive $state getter provided by RouterProvider.
  // When this function is called inside $derived(), Svelte tracks
  // the dependency on the underlying $state variable.
  const getState = getRouterStateContext();
  const selector = opts?.select ?? ((s: any) => s as TSelected);
  return selector(getState() as RouterState<TRouter["routeTree"]>);
}
