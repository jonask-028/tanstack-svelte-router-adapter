/**
 * Svelte Router — Route classes and factory functions.
 *
 * Mirrors the pattern used by @tanstack/solid-router and @tanstack/vue-router:
 * - `Route` extends `BaseRoute` with framework-specific hook methods
 * - `RootRoute` extends `BaseRootRoute` with framework-specific hook methods
 * - `RouteApi` / `getRouteApi()` — typed route API with bound hooks
 * - `createRoute()` / `createRootRoute()` / `createRootRouteWithContext()` factories
 * - Svelte-specific component type aliases
 */
import { BaseRoute, BaseRootRoute, BaseRouteApi } from "@tanstack/router-core";
import type { AnyRoute, AnyContext, AnyRouter, RouteConstraints, ResolveFullPath, ResolveId, ResolveParams, RouteOptions, RootRouteOptions, Register, RegisteredRouter, RootRouteId, RouteTypesById, UseNavigateResult } from "@tanstack/router-core";
import type { Component } from "svelte";
/**
 * Svelte component used as a route's `component` option.
 */
export type RouteComponent = Component<any>;
/**
 * Svelte component used as a route's `errorComponent` option.
 * Receives an `error` prop.
 */
export type ErrorRouteComponent = Component<{
    error: Error;
    reset?: () => void;
}>;
/**
 * Svelte component used for not-found routes.
 */
export type NotFoundRouteComponent = Component<{
    data?: any;
}>;
/**
 * Sync or async route component (lazy loading support).
 */
export type SyncRouteComponent<TProps extends Record<string, any> = any> = Component<TProps>;
type UseMatchRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (match: any) => TSelected;
}) => TSelected;
type UseRouteContextRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (context: any) => TSelected;
}) => TSelected;
type UseSearchRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (search: any) => TSelected;
}) => TSelected;
type UseParamsRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (params: any) => TSelected;
}) => TSelected;
type UseLoaderDepsRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (deps: any) => TSelected;
}) => TSelected;
type UseLoaderDataRoute<TId> = <TRouter extends AnyRouter = RegisteredRouter, TSelected = unknown>(opts?: {
    select?: (data: any) => TSelected;
}) => TSelected;
declare module "@tanstack/router-core" {
    interface UpdatableRouteOptionsExtensions {
        component?: RouteComponent;
        errorComponent?: false | null | undefined | ErrorRouteComponent;
        notFoundComponent?: NotFoundRouteComponent;
        pendingComponent?: RouteComponent;
    }
    interface RouteExtensions<in out TId extends string, in out TFullPath extends string> {
        useMatch: UseMatchRoute<TId>;
        useRouteContext: UseRouteContextRoute<TId>;
        useSearch: UseSearchRoute<TId>;
        useParams: UseParamsRoute<TId>;
        useLoaderDeps: UseLoaderDepsRoute<TId>;
        useLoaderData: UseLoaderDataRoute<TId>;
        useNavigate: () => UseNavigateResult<TFullPath>;
    }
}
export declare class Route<in out TRegister = unknown, in out TParentRoute extends RouteConstraints["TParentRoute"] = AnyRoute, in out TPath extends RouteConstraints["TPath"] = "/", in out TFullPath extends RouteConstraints["TFullPath"] = ResolveFullPath<TParentRoute, TPath>, in out TCustomId extends RouteConstraints["TCustomId"] = string, in out TId extends RouteConstraints["TId"] = ResolveId<TParentRoute, TCustomId, TPath>, in out TSearchValidator = undefined, in out TParams = ResolveParams<TPath>, in out TRouterContext = AnyContext, in out TRouteContextFn = AnyContext, in out TBeforeLoadFn = AnyContext, in out TLoaderDeps extends Record<string, any> = {}, in out TLoaderFn = undefined, in out TChildren = unknown, in out TFileRouteTypes = unknown, in out TSSR = unknown, in out TMiddlewares = unknown, in out THandlers = undefined> extends BaseRoute<TRegister, TParentRoute, TPath, TFullPath, TCustomId, TId, TSearchValidator, TParams, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TChildren, TFileRouteTypes, TSSR, TMiddlewares, THandlers> {
    /**
     * @deprecated Use the `createRoute` function instead.
     */
    constructor(options?: any);
    useMatch: UseMatchRoute<TId>;
    useRouteContext: UseRouteContextRoute<TId>;
    useSearch: UseSearchRoute<TId>;
    useParams: UseParamsRoute<TId>;
    useLoaderDeps: UseLoaderDepsRoute<TId>;
    useLoaderData: UseLoaderDataRoute<TId>;
    useNavigate: () => UseNavigateResult<TFullPath>;
}
export declare class RootRoute<in out TRegister = Register, in out TSearchValidator = undefined, in out TRouterContext = {}, in out TRouteContextFn = AnyContext, in out TBeforeLoadFn = AnyContext, in out TLoaderDeps extends Record<string, any> = {}, in out TLoaderFn = undefined, in out TChildren = unknown, in out TFileRouteTypes = unknown, in out TSSR = unknown, in out THandlers = undefined> extends BaseRootRoute<TRegister, TSearchValidator, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TChildren, TFileRouteTypes, TSSR, THandlers> {
    /**
     * @deprecated Use `createRootRoute()` instead.
     */
    constructor(options?: any);
    useMatch: UseMatchRoute<RootRouteId>;
    useRouteContext: UseRouteContextRoute<RootRouteId>;
    useSearch: UseSearchRoute<RootRouteId>;
    useParams: UseParamsRoute<RootRouteId>;
    useLoaderDeps: UseLoaderDepsRoute<RootRouteId>;
    useLoaderData: UseLoaderDataRoute<RootRouteId>;
    useNavigate: () => UseNavigateResult<"/">;
}
export type AnyRootRoute = RootRoute<any, any, any, any, any, any, any, any, any, any>;
export declare function createRoute<TRegister = unknown, TParentRoute extends RouteConstraints["TParentRoute"] = AnyRoute, TPath extends RouteConstraints["TPath"] = "/", TFullPath extends RouteConstraints["TFullPath"] = ResolveFullPath<TParentRoute, TPath>, TCustomId extends RouteConstraints["TCustomId"] = string, TId extends RouteConstraints["TId"] = ResolveId<TParentRoute, TCustomId, TPath>, TSearchValidator = undefined, TParams = ResolveParams<TPath>, TRouteContextFn = AnyContext, TBeforeLoadFn = AnyContext, TLoaderDeps extends Record<string, any> = {}, TLoaderFn = undefined, TChildren = unknown, TSSR = unknown, THandlers = undefined>(options: RouteOptions<TRegister, TParentRoute, TId, TCustomId, TFullPath, TPath, TSearchValidator, TParams, TLoaderDeps, TLoaderFn, AnyContext, TRouteContextFn, TBeforeLoadFn, TSSR, THandlers>): Route<TRegister, TParentRoute, TPath, TFullPath, TCustomId, TId, TSearchValidator, TParams, AnyContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TChildren, unknown, TSSR, THandlers>;
export declare function createRootRoute<TRegister = Register, TSearchValidator = undefined, TRouterContext = {}, TRouteContextFn = AnyContext, TBeforeLoadFn = AnyContext, TLoaderDeps extends Record<string, any> = {}, TLoaderFn = undefined, TSSR = unknown, THandlers = undefined>(options?: RootRouteOptions<TRegister, TSearchValidator, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TSSR, THandlers>): RootRoute<TRegister, TSearchValidator, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, unknown, unknown, TSSR, THandlers>;
export declare function createRootRouteWithContext<TRouterContext extends {}>(): <TRegister = Register, TRouteContextFn = AnyContext, TBeforeLoadFn = AnyContext, TSearchValidator = undefined, TLoaderDeps extends Record<string, any> = {}, TLoaderFn = undefined, TSSR = unknown, THandlers = undefined>(options?: RootRouteOptions<TRegister, TSearchValidator, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TSSR, THandlers>) => RootRoute<TRegister, TSearchValidator, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, unknown, unknown, TSSR, THandlers>;
/**
 * @deprecated Use the `createRootRouteWithContext` function instead.
 */
export declare const rootRouteWithContext: typeof createRootRouteWithContext;
export declare class NotFoundRoute<TRegister = unknown, TParentRoute extends AnyRootRoute = AnyRootRoute, TRouterContext = AnyContext, TRouteContextFn = AnyContext, TBeforeLoadFn = AnyContext, TSearchValidator = undefined, TLoaderDeps extends Record<string, any> = {}, TLoaderFn = undefined, TChildren = unknown, TSSR = unknown, THandlers = undefined> extends Route<TRegister, TParentRoute, "/404", "/404", "404", "404", TSearchValidator, {}, TRouterContext, TRouteContextFn, TBeforeLoadFn, TLoaderDeps, TLoaderFn, TChildren, unknown, TSSR, unknown, THandlers> {
    constructor(options?: any);
}
export declare class RouteApi<TId, TRouter extends AnyRouter = RegisteredRouter> extends BaseRouteApi<TId, TRouter> {
    /**
     * @deprecated Use the `getRouteApi` function instead.
     */
    constructor({ id }: {
        id: TId;
    });
    useMatch: UseMatchRoute<TId>;
    useRouteContext: UseRouteContextRoute<TId>;
    useSearch: UseSearchRoute<TId>;
    useParams: UseParamsRoute<TId>;
    useLoaderDeps: UseLoaderDepsRoute<TId>;
    useLoaderData: UseLoaderDataRoute<TId>;
    useNavigate: () => UseNavigateResult<RouteTypesById<TRouter, TId>["fullPath"]>;
}
/**
 * Get a type-safe API for accessing route data outside of route components.
 */
export declare function getRouteApi<TId extends string>(id: TId): RouteApi<TId, AnyRouter>;
export {};
//# sourceMappingURL=route.d.ts.map