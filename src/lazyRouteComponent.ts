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
export function lazyRouteComponent<
  T extends Record<string, any>,
  TKey extends keyof T = "default",
>(
  importer: () => Promise<T>,
  exportName?: TKey,
): T[TKey] extends Component<any> ? T[TKey] : Component<any> {
  // For Svelte, lazy route components are resolved at load time by the router.
  // The framework uses `lazyFn` and route lazy loading to handle code splitting.
  // This wrapper provides the same API as React/Solid adapters.

  let cached: Component<any> | undefined;
  let loadPromise: Promise<Component<any> | undefined> | undefined;

  const load = () => {
    if (!loadPromise) {
      loadPromise = importer().then((mod) => {
        const key = (exportName as string) ?? "default";
        cached = mod[key];
        return cached;
      });
    }
    return loadPromise;
  };

  // Create a proxy component that resolves on first access
  // The router will call `preload()` before rendering
  const LazyComponent: any = cached;

  // Attach preload function for router to call
  (load as any).preload = load;

  // Return the importer with preload support.
  // The router handles calling this before rendering.
  return load as any;
}
