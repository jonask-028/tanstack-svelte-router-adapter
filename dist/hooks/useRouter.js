import warning from "tiny-warning";
import { getRouterContext } from "../context/index.js";
/**
 * Access the router instance from within a Svelte component.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useRouter } from '@tanstack/svelte-router'
 *   const router = useRouter()
 * </script>
 * ```
 */
export function useRouter(opts) {
    const value = getRouterContext();
    warning(!((opts?.warn ?? true) && !value), "useRouter must be used inside a <RouterProvider> component!");
    return value;
}
