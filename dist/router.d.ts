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
import type { RouterHistory } from "@tanstack/history";
import type { AnyRoute, CreateRouterFn, TrailingSlashOption } from "@tanstack/router-core";
import type { RouteComponent, ErrorRouteComponent, NotFoundRouteComponent } from "./route.js";
declare module "@tanstack/router-core" {
    interface RouterOptionsExtensions {
        /**
         * Default Svelte component rendered for routes that don't specify one.
         */
        defaultComponent?: RouteComponent;
        /**
         * Default Svelte component rendered when a route throws an error.
         */
        defaultErrorComponent?: ErrorRouteComponent;
        /**
         * Default Svelte component rendered while a route is loading.
         */
        defaultPendingComponent?: RouteComponent;
        /**
         * Default Svelte component rendered for 404 / not-found.
         */
        defaultNotFoundComponent?: NotFoundRouteComponent;
    }
}
export declare class Router<in out TRouteTree extends AnyRoute = AnyRoute, in out TTrailingSlashOption extends TrailingSlashOption = "never", in out TDefaultStructuralSharingOption extends boolean = false, in out TRouterHistory extends RouterHistory = RouterHistory, in out TDehydrated extends Record<string, any> = Record<string, any>> extends RouterCore<TRouteTree, TTrailingSlashOption, TDefaultStructuralSharingOption, TRouterHistory, TDehydrated> {
}
export declare const createRouter: CreateRouterFn;
//# sourceMappingURL=router.d.ts.map