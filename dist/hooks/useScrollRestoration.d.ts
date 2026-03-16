import type { ParsedLocation, ScrollRestorationEntry } from "@tanstack/router-core";
/**
 * Enable scroll restoration for the router. Calls `setupScrollRestoration`
 * from router-core which:
 * - Sets `window.history.scrollRestoration = 'manual'`
 * - Attaches scroll listeners to track positions
 * - Subscribes to router `onRendered` events to restore scroll positions
 *
 * This is called internally; prefer using `createRouter({ scrollRestoration: true })`
 * or the deprecated `ScrollRestoration` component.
 */
export declare function useScrollRestoration(): void;
/**
 * Track and restore scroll position for a specific element.
 *
 * Returns the cached `ScrollRestorationEntry` for the given element at the
 * current location, so you can apply it manually (e.g. on mount or after
 * async content loads).
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useElementScrollRestoration } from '@tanstack/svelte-router'
 *
 *   const entry = useElementScrollRestoration({ id: 'my-list' })
 *   // Apply entry.scrollX / entry.scrollY to your element on mount
 * </script>
 *
 * <div data-scroll-restoration-id="my-list">
 *   <!-- scrollable content -->
 * </div>
 * ```
 */
export declare function useElementScrollRestoration(options: {
    id?: string;
    getElement?: () => Window | Element | undefined | null;
    getKey?: (location: ParsedLocation) => string;
}): ScrollRestorationEntry | undefined;
//# sourceMappingURL=useScrollRestoration.d.ts.map