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
import { useMatch } from "./hooks/useMatch.js";
import { useSearch } from "./hooks/useSearch.js";
import { useParams } from "./hooks/useParams.js";
import { useLoaderData } from "./hooks/useLoaderData.js";
import { useLoaderDeps } from "./hooks/useLoaderDeps.js";
import { useNavigate } from "./hooks/useNavigate.js";
import { useRouter } from "./hooks/useRouter.js";
import type {
  AnyRoute,
  AnyContext,
  AnyRouter,
  RouteConstraints,
  ResolveFullPath,
  ResolveId,
  ResolveParams,
  RouteOptions,
  RootRouteOptions,
  Register,
  RegisteredRouter,
  RootRouteId,
  RouteTypesById,
  UseNavigateResult,
} from "@tanstack/router-core";
import type { Component } from "svelte";

// ---------------------------------------------------------------------------
// Svelte-specific component type aliases
// ---------------------------------------------------------------------------

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
export type NotFoundRouteComponent = Component<{ data?: any }>;

/**
 * Sync or async route component (lazy loading support).
 */
export type SyncRouteComponent<TProps extends Record<string, any> = any> =
  Component<TProps>;

// ---------------------------------------------------------------------------
// Hook type aliases for route-bound methods
// ---------------------------------------------------------------------------

type UseMatchRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (match: any) => TSelected;
}) => TSelected;

type UseRouteContextRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (context: any) => TSelected;
}) => TSelected;

type UseSearchRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (search: any) => TSelected;
}) => TSelected;

type UseParamsRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (params: any) => TSelected;
}) => TSelected;

type UseLoaderDepsRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (deps: any) => TSelected;
}) => TSelected;

type UseLoaderDataRoute<TId> = <
  TRouter extends AnyRouter = RegisteredRouter,
  TSelected = unknown,
>(opts?: {
  select?: (data: any) => TSelected;
}) => TSelected;

// ---------------------------------------------------------------------------
// Module augmentation — extend RouteExtensions so router-core knows our hooks
// ---------------------------------------------------------------------------

declare module "@tanstack/router-core" {
  export interface UpdatableRouteOptionsExtensions {
    component?: RouteComponent;
    errorComponent?: false | null | undefined | ErrorRouteComponent;
    notFoundComponent?: NotFoundRouteComponent;
    pendingComponent?: RouteComponent;
  }

  export interface RouteExtensions<
    in out TId extends string,
    in out TFullPath extends string,
  > {
    useMatch: UseMatchRoute<TId>;
    useRouteContext: UseRouteContextRoute<TId>;
    useSearch: UseSearchRoute<TId>;
    useParams: UseParamsRoute<TId>;
    useLoaderDeps: UseLoaderDepsRoute<TId>;
    useLoaderData: UseLoaderDataRoute<TId>;
    useNavigate: () => UseNavigateResult<TFullPath>;
  }
}

// ---------------------------------------------------------------------------
// Route class
// ---------------------------------------------------------------------------

export class Route<
  in out TRegister = unknown,
  in out TParentRoute extends RouteConstraints["TParentRoute"] = AnyRoute,
  in out TPath extends RouteConstraints["TPath"] = "/",
  in out TFullPath extends RouteConstraints["TFullPath"] = ResolveFullPath<
    TParentRoute,
    TPath
  >,
  in out TCustomId extends RouteConstraints["TCustomId"] = string,
  in out TId extends RouteConstraints["TId"] = ResolveId<
    TParentRoute,
    TCustomId,
    TPath
  >,
  in out TSearchValidator = undefined,
  in out TParams = ResolveParams<TPath>,
  in out TRouterContext = AnyContext,
  in out TRouteContextFn = AnyContext,
  in out TBeforeLoadFn = AnyContext,
  in out TLoaderDeps extends Record<string, any> = {},
  in out TLoaderFn = undefined,
  in out TChildren = unknown,
  in out TFileRouteTypes = unknown,
  in out TSSR = unknown,
  in out TMiddlewares = unknown,
  in out THandlers = undefined,
> extends BaseRoute<
  TRegister,
  TParentRoute,
  TPath,
  TFullPath,
  TCustomId,
  TId,
  TSearchValidator,
  TParams,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  TFileRouteTypes,
  TSSR,
  TMiddlewares,
  THandlers
> {
  /**
   * @deprecated Use the `createRoute` function instead.
   */
  constructor(options?: any) {
    super(options);
  }

  useMatch: UseMatchRoute<TId> = (opts) => {
    return useMatch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useRouteContext: UseRouteContextRoute<TId> = (opts?) => {
    return useMatch({
      ...opts,
      from: this.id,
      select: (d: any) => (opts?.select ? opts.select(d.context) : d.context),
    }) as any;
  };

  useSearch: UseSearchRoute<TId> = (opts) => {
    return useSearch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useParams: UseParamsRoute<TId> = (opts) => {
    return useParams({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useLoaderDeps: UseLoaderDepsRoute<TId> = (opts) => {
    return useLoaderDeps({ ...opts, from: this.id } as any);
  };

  useLoaderData: UseLoaderDataRoute<TId> = (opts) => {
    return useLoaderData({ ...opts, from: this.id } as any);
  };

  useNavigate = (): UseNavigateResult<TFullPath> => {
    return useNavigate({ from: this.fullPath });
  };
}

// ---------------------------------------------------------------------------
// RootRoute class
// ---------------------------------------------------------------------------

export class RootRoute<
  in out TRegister = Register,
  in out TSearchValidator = undefined,
  in out TRouterContext = {},
  in out TRouteContextFn = AnyContext,
  in out TBeforeLoadFn = AnyContext,
  in out TLoaderDeps extends Record<string, any> = {},
  in out TLoaderFn = undefined,
  in out TChildren = unknown,
  in out TFileRouteTypes = unknown,
  in out TSSR = unknown,
  in out THandlers = undefined,
> extends BaseRootRoute<
  TRegister,
  TSearchValidator,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  TFileRouteTypes,
  TSSR,
  THandlers
> {
  /**
   * @deprecated Use `createRootRoute()` instead.
   */
  constructor(options?: any) {
    super(options);
  }

  useMatch: UseMatchRoute<RootRouteId> = (opts) => {
    return useMatch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useRouteContext: UseRouteContextRoute<RootRouteId> = (opts) => {
    return useMatch({
      ...opts,
      from: this.id,
      select: (d: any) => (opts?.select ? opts.select(d.context) : d.context),
    }) as any;
  };

  useSearch: UseSearchRoute<RootRouteId> = (opts) => {
    return useSearch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useParams: UseParamsRoute<RootRouteId> = (opts) => {
    return useParams({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useLoaderDeps: UseLoaderDepsRoute<RootRouteId> = (opts) => {
    return useLoaderDeps({ ...opts, from: this.id } as any);
  };

  useLoaderData: UseLoaderDataRoute<RootRouteId> = (opts) => {
    return useLoaderData({ ...opts, from: this.id } as any);
  };

  useNavigate = (): UseNavigateResult<"/"> => {
    return useNavigate({ from: this.fullPath });
  };
}

// ---------------------------------------------------------------------------
// AnyRootRoute type alias
// ---------------------------------------------------------------------------

export type AnyRootRoute = RootRoute<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

// ---------------------------------------------------------------------------
// createRoute factory
// ---------------------------------------------------------------------------

export function createRoute<
  TRegister = unknown,
  TParentRoute extends RouteConstraints["TParentRoute"] = AnyRoute,
  TPath extends RouteConstraints["TPath"] = "/",
  TFullPath extends RouteConstraints["TFullPath"] = ResolveFullPath<
    TParentRoute,
    TPath
  >,
  TCustomId extends RouteConstraints["TCustomId"] = string,
  TId extends RouteConstraints["TId"] = ResolveId<
    TParentRoute,
    TCustomId,
    TPath
  >,
  TSearchValidator = undefined,
  TParams = ResolveParams<TPath>,
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TChildren = unknown,
  TSSR = unknown,
  THandlers = undefined,
>(
  options: RouteOptions<
    TRegister,
    TParentRoute,
    TId,
    TCustomId,
    TFullPath,
    TPath,
    TSearchValidator,
    TParams,
    TLoaderDeps,
    TLoaderFn,
    AnyContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TSSR,
    THandlers
  >,
): Route<
  TRegister,
  TParentRoute,
  TPath,
  TFullPath,
  TCustomId,
  TId,
  TSearchValidator,
  TParams,
  AnyContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  unknown,
  TSSR,
  THandlers
> {
  return new Route(options as any) as any;
}

// ---------------------------------------------------------------------------
// createRootRoute factory
// ---------------------------------------------------------------------------

export function createRootRoute<
  TRegister = Register,
  TSearchValidator = undefined,
  TRouterContext = {},
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TSSR = unknown,
  THandlers = undefined,
>(
  options?: RootRouteOptions<
    TRegister,
    TSearchValidator,
    TRouterContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TLoaderDeps,
    TLoaderFn,
    TSSR,
    THandlers
  >,
): RootRoute<
  TRegister,
  TSearchValidator,
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  unknown,
  unknown,
  TSSR,
  THandlers
> {
  return new RootRoute<
    TRegister,
    TSearchValidator,
    TRouterContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TLoaderDeps,
    TLoaderFn,
    unknown,
    unknown,
    TSSR,
    THandlers
  >(options as any);
}

// ---------------------------------------------------------------------------
// createRootRouteWithContext
// ---------------------------------------------------------------------------

export function createRootRouteWithContext<TRouterContext extends {}>() {
  return <
    TRegister = Register,
    TRouteContextFn = AnyContext,
    TBeforeLoadFn = AnyContext,
    TSearchValidator = undefined,
    TLoaderDeps extends Record<string, any> = {},
    TLoaderFn = undefined,
    TSSR = unknown,
    THandlers = undefined,
  >(
    options?: RootRouteOptions<
      TRegister,
      TSearchValidator,
      TRouterContext,
      TRouteContextFn,
      TBeforeLoadFn,
      TLoaderDeps,
      TLoaderFn,
      TSSR,
      THandlers
    >,
  ) => {
    return createRootRoute<
      TRegister,
      TSearchValidator,
      TRouterContext,
      TRouteContextFn,
      TBeforeLoadFn,
      TLoaderDeps,
      TLoaderFn,
      TSSR,
      THandlers
    >(options as any);
  };
}

/**
 * @deprecated Use the `createRootRouteWithContext` function instead.
 */
export const rootRouteWithContext = createRootRouteWithContext;

// ---------------------------------------------------------------------------
// NotFoundRoute class
// ---------------------------------------------------------------------------

export class NotFoundRoute<
  TRegister = unknown,
  TParentRoute extends AnyRootRoute = AnyRootRoute,
  TRouterContext = AnyContext,
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  TSearchValidator = undefined,
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TChildren = unknown,
  TSSR = unknown,
  THandlers = undefined,
> extends Route<
  TRegister,
  TParentRoute,
  "/404",
  "/404",
  "404",
  "404",
  TSearchValidator,
  {},
  TRouterContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  unknown,
  TSSR,
  unknown,
  THandlers
> {
  constructor(options?: any) {
    super({
      ...options,
      id: "404",
    });
  }
}

// ---------------------------------------------------------------------------
// RouteApi class — typed route API with bound hook methods
// ---------------------------------------------------------------------------

export class RouteApi<
  TId,
  TRouter extends AnyRouter = RegisteredRouter,
> extends BaseRouteApi<TId, TRouter> {
  /**
   * @deprecated Use the `getRouteApi` function instead.
   */
  constructor({ id }: { id: TId }) {
    super({ id });
  }

  useMatch: UseMatchRoute<TId> = (opts) => {
    return useMatch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useRouteContext: UseRouteContextRoute<TId> = (opts) => {
    return useMatch({
      from: this.id as any,
      select: (d: any) => (opts?.select ? opts.select(d.context) : d.context),
    }) as any;
  };

  useSearch: UseSearchRoute<TId> = (opts) => {
    return useSearch({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useParams: UseParamsRoute<TId> = (opts) => {
    return useParams({
      select: opts?.select,
      from: this.id,
    } as any) as any;
  };

  useLoaderDeps: UseLoaderDepsRoute<TId> = (opts) => {
    return useLoaderDeps({ ...opts, from: this.id, strict: false } as any);
  };

  useLoaderData: UseLoaderDataRoute<TId> = (opts) => {
    return useLoaderData({ ...opts, from: this.id, strict: false } as any);
  };

  useNavigate = (): UseNavigateResult<
    RouteTypesById<TRouter, TId>["fullPath"]
  > => {
    const router = useRouter();
    return useNavigate({
      from: router.routesById[this.id as string].fullPath,
    });
  };
}

// ---------------------------------------------------------------------------
// getRouteApi
// ---------------------------------------------------------------------------

/**
 * Get a type-safe API for accessing route data outside of route components.
 */
export function getRouteApi<TId extends string>(id: TId) {
  return new RouteApi({ id });
}

// ---------------------------------------------------------------------------
// createRouteMask
// ---------------------------------------------------------------------------

/**
 * Create a typed route mask. Route masks allow you to display a different URL
 * in the browser address bar while internally navigating to a different route.
 *
 * @example
 * ```ts
 * const routeMask = createRouteMask({
 *   routeTree,
 *   from: '/posts/$postId',
 *   to: '/posts',
 *   params: true,
 * })
 * ```
 */
export function createRouteMask<
  TRouteTree extends AnyRoute,
  TFrom extends string,
  TTo extends string,
>(
  opts: {
    routeTree: TRouteTree;
  } & import("@tanstack/router-core").ToMaskOptions<
    import("@tanstack/router-core").RouterCore<TRouteTree, "never", boolean>,
    TFrom,
    TTo
  >,
): import("@tanstack/router-core").RouteMask<TRouteTree> {
  return opts as any;
}
