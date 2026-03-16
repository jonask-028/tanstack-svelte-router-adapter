import { useRouter } from "./useRouter.js";
import type { AnyRouter, RegisteredRouter } from "@tanstack/router-core";

/**
 * Check if the router can go back in history.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useCanGoBack } from '@tanstack/svelte-router'
 *   const canGoBack = useCanGoBack()
 * </script>
 * ```
 */
export function useCanGoBack<
  TRouter extends AnyRouter = RegisteredRouter,
>(): boolean {
  const router = useRouter<TRouter>();
  return router.history.canGoBack();
}
