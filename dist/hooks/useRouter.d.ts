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
export declare function useRouter<TRouter extends AnyRouter = RegisteredRouter>(opts?: {
    warn?: boolean;
}): TRouter;
//# sourceMappingURL=useRouter.d.ts.map