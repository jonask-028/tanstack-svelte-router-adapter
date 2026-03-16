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
export declare function useHydrated(): boolean;
//# sourceMappingURL=useHydrated.d.ts.map