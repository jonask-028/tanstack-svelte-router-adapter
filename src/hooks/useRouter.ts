import warning from "tiny-warning";
import { getRouterContext } from "../context/index.js";
import type { AnyRouter, RegisteredRouter } from "@tanstack/router-core";

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
export function useRouter<TRouter extends AnyRouter = RegisteredRouter>(opts?: {
  warn?: boolean;
}): TRouter {
  const value = getRouterContext<TRouter>();
  warning(
    !((opts?.warn ?? true) && !value),
    "useRouter must be used inside a <RouterProvider> component!",
  );
  return value;
}
