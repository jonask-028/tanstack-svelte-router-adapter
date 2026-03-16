import type { Component } from "svelte";
/**
 * Create a lazy-loaded route component from a dynamic import.
 *
 * Wraps a dynamic import so TanStack Router can code-split route components.
 * The import function should return a module with a default export (the component)
 * or a named export specified by `exportName`.
 *
 * @example
 * ```typescript
 * import { createRoute, lazyRouteComponent } from '@tanstack/svelte-router'
 *
 * const aboutRoute = createRoute({
 *   getParentRoute: () => rootRoute,
 *   path: '/about',
 *   component: lazyRouteComponent(() => import('./pages/About.svelte')),
 * })
 * ```
 */
export declare function lazyRouteComponent<T extends Record<string, any>, TKey extends keyof T = "default">(importer: () => Promise<T>, exportName?: TKey): T[TKey] extends Component<any> ? T[TKey] : Component<any>;
//# sourceMappingURL=lazyRouteComponent.d.ts.map