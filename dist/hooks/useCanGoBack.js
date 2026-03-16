import { useRouter } from "./useRouter.js";
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
export function useCanGoBack() {
    const router = useRouter();
    return router.history.canGoBack();
}
