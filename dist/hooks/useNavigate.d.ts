import type { AnyRouter, RegisteredRouter, UseNavigateResult } from "@tanstack/router-core";
export type { UseNavigateResult } from "@tanstack/router-core";
/**
 * Get a navigate function to imperatively navigate between routes.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useNavigate } from '@tanstack/svelte-router'
 *   const navigate = useNavigate()
 *
 *   function goToOrgs() {
 *     navigate({ to: '/orgs' })
 *   }
 * </script>
 * ```
 */
export declare function useNavigate<TRouter extends AnyRouter = RegisteredRouter, TDefaultFrom extends string = string>(opts?: {
    from?: TDefaultFrom;
}): UseNavigateResult<TDefaultFrom>;
//# sourceMappingURL=useNavigate.d.ts.map