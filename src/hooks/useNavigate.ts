import { useRouter } from "./useRouter.js";
import type {
  AnyRouter,
  RegisteredRouter,
  NavigateOptions,
  RoutePaths,
  UseNavigateResult,
} from "@tanstack/router-core";

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
export function useNavigate<
  TRouter extends AnyRouter = RegisteredRouter,
  TDefaultFrom extends string = string,
>(opts?: { from?: TDefaultFrom }): UseNavigateResult<TDefaultFrom> {
  const router = useRouter<TRouter>();
  return ((navOpts: any) => {
    return router.navigate({
      ...navOpts,
      from: navOpts.from ?? opts?.from,
    });
  }) as UseNavigateResult<TDefaultFrom>;
}
