import type { AnyRouter, RegisteredRouter, RouterState } from "@tanstack/router-core";
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
export declare function useRouterState<TRouter extends AnyRouter = RegisteredRouter, TSelected = RouterState<TRouter["routeTree"]>>(opts?: {
    router?: TRouter;
    select?: (state: RouterState<TRouter["routeTree"]>) => TSelected;
}): TSelected;
//# sourceMappingURL=useRouterState.d.ts.map