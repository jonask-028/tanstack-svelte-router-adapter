/**
 * Svelte Router — Router class and createRouter factory.
 *
 * Mirrors the pattern used by @tanstack/solid-router and @tanstack/vue-router:
 * - `Router` extends `RouterCore` from router-core
 * - `createRouter` is a factory function typed with `CreateRouterFn`
 *
 * The Router class adds framework-specific extensions (Svelte component types
 * for defaultComponent, defaultErrorComponent, etc.) via module augmentation.
 */
import { RouterCore } from "@tanstack/router-core";
import { createFileRoute, createLazyFileRoute } from "./fileRoute.js";
// ---------------------------------------------------------------------------
// Router class
// ---------------------------------------------------------------------------
export class Router extends RouterCore {
}
// ---------------------------------------------------------------------------
// createRouter factory
// ---------------------------------------------------------------------------
export const createRouter = (options) => {
    return new Router(options);
};
// ---------------------------------------------------------------------------
// Global registration for file-based routing code generation.
// The TanStack Router generator (tsr generate / tsr watch) relies on
// createFileRoute and createLazyFileRoute being available on globalThis
// at module-load time for code-split route files.
// ---------------------------------------------------------------------------
if (typeof globalThis !== "undefined") {
    ;
    globalThis.createFileRoute = createFileRoute;
    ;
    globalThis.createLazyFileRoute = createLazyFileRoute;
}
else if (typeof window !== "undefined") {
    ;
    window.createFileRoute = createFileRoute;
    ;
    window.createLazyFileRoute = createLazyFileRoute;
}
