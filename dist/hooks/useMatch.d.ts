import type { AnyRouter, RegisteredRouter, RouteById, RouteIds, StrictOrFrom } from "@tanstack/router-core";
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
export declare function useMatch<TRouter extends AnyRouter = RegisteredRouter, TFrom extends RouteIds<TRouter["routeTree"]> = RouteIds<TRouter["routeTree"]>, TStrict extends boolean = true, TThrow extends boolean = true, TSelected = RouteById<TRouter["routeTree"], TFrom>>(opts?: StrictOrFrom<TRouter, TFrom, TStrict> & {
    select?: (match: any) => TSelected;
    shouldThrow?: TThrow;
}): TSelected;
//# sourceMappingURL=useMatch.d.ts.map