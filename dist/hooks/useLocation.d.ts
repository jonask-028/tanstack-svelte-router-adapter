import type { AnyRouter, RegisteredRouter, ParsedLocation } from "@tanstack/router-core";
/**
 * Get the current parsed location.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useLocation } from '@tanstack/svelte-router'
 *   let location = $derived(useLocation())
 *   // location.pathname, location.search, location.hash
 * </script>
 * ```
 */
export declare function useLocation<TRouter extends AnyRouter = RegisteredRouter>(): ParsedLocation;
//# sourceMappingURL=useLocation.d.ts.map