let _hydrated = false;
/**
 * Returns `true` once the component has mounted on the client.
 * Returns `false` during SSR and the initial hydration pass.
 *
 * Useful for conditionally rendering client-only content.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useHydrated } from '@tanstack/svelte-router'
 *   const hydrated = useHydrated()
 * </script>
 *
 * {#if hydrated}
 *   <canvas id="webgl" />
 * {/if}
 * ```
 */
export function useHydrated() {
    // Once any component has mounted, we know we're on the client
    if (_hydrated)
        return true;
    // Check if we're in a browser
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        _hydrated = true;
        return true;
    }
    return false;
}
