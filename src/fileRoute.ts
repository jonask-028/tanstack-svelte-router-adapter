/**
 * Svelte Router — File-based route classes and factory functions.
 *
 * Mirrors the pattern used by @tanstack/solid-router and @tanstack/vue-router:
 * - `FileRoute` class with `.createRoute` method
 * - `createFileRoute(path)` returns a route factory function
 * - `createLazyFileRoute(path)` for lazy-loaded file routes
 * - `createLazyRoute(id)` for lazy-loaded code-split routes
 * - `LazyRoute` class with bound hook methods
 */

import { createRoute } from "./route.js";

import { useMatch } from "./hooks/useMatch.js";
import { useLoaderDeps } from "./hooks/useLoaderDeps.js";
import { useLoaderData } from "./hooks/useLoaderData.js";
import { useSearch } from "./hooks/useSearch.js";
import { useParams } from "./hooks/useParams.js";
import { useNavigate } from "./hooks/useNavigate.js";
import { useRouter } from "./hooks/useRouter.js";
import { useRouteContext } from "./hooks/useRouteContext.js";

import type {
  AnyRoute,
  AnyRouter,
  AnyContext,
  RouteConstraints,
  FileRoutesByPath,
  LazyRouteOptions,
  RegisteredRouter,
  RouteById,
  RouteIds,
  ConstrainLiteral,
  UseNavigateResult,
} from "@tanstack/router-core";

// ---------------------------------------------------------------------------
// Hook type aliases (match what solid-router uses)
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
// FileRoute class
// ---------------------------------------------------------------------------

/**
 * @deprecated Use `createFileRoute(path)(options)` instead.
 */
export class FileRoute<
  TFilePath extends keyof FileRoutesByPath,
  TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]["parentRoute"],
  TId extends RouteConstraints["TId"] = FileRoutesByPath[TFilePath]["id"],
  TPath extends RouteConstraints["TPath"] = FileRoutesByPath[TFilePath]["path"],
  TFullPath extends RouteConstraints["TFullPath"] =
    FileRoutesByPath[TFilePath]["fullPath"],
> {
  silent?: boolean;

  constructor(
    public path?: TFilePath,
    _opts?: { silent: boolean },
  ) {
    this.silent = _opts?.silent;
  }

  createRoute = (options?: any): any => {
    const route = createRoute(options as any);
    (route as any).isRoot = false;
    return route as any;
  };
}

// ---------------------------------------------------------------------------
// createFileRoute
// ---------------------------------------------------------------------------

/**
 * Creates a file-based route factory bound to a specific path.
 *
 * Handles both the standard string form and the object form used by
 * virtual file-based routes:
 * - `createFileRoute('/path')(options)` — standard
 * - `createFileRoute({ component: ... })` — virtual (object arg)
 */
export function createFileRoute<
  TFilePath extends keyof FileRoutesByPath,
  TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]["parentRoute"],
  TId extends RouteConstraints["TId"] = FileRoutesByPath[TFilePath]["id"],
  TPath extends RouteConstraints["TPath"] = FileRoutesByPath[TFilePath]["path"],
  TFullPath extends RouteConstraints["TFullPath"] =
    FileRoutesByPath[TFilePath]["fullPath"],
>(
  path?: TFilePath,
): FileRoute<TFilePath, TParentRoute, TId, TPath, TFullPath>["createRoute"] {
  // Object form: createFileRoute({ component, ... }) — used by virtual routes
  if (typeof path === "object") {
    return new FileRoute<TFilePath, TParentRoute, TId, TPath, TFullPath>(path, {
      silent: true,
    }).createRoute(path) as any;
  }
  return new FileRoute<TFilePath, TParentRoute, TId, TPath, TFullPath>(path, {
    silent: true,
  }).createRoute;
}

// ---------------------------------------------------------------------------
// Module augmentation — extend router-core's LazyRoute interface with hooks
// ---------------------------------------------------------------------------

declare module "@tanstack/router-core" {
  export interface LazyRoute<in out TRoute extends AnyRoute> {
    useMatch: UseMatchRoute<TRoute["id"]>;
    useRouteContext: UseRouteContextRoute<TRoute["id"]>;
    useSearch: UseSearchRoute<TRoute["id"]>;
    useParams: UseParamsRoute<TRoute["id"]>;
    useLoaderDeps: UseLoaderDepsRoute<TRoute["id"]>;
    useLoaderData: UseLoaderDataRoute<TRoute["id"]>;
    useNavigate: () => UseNavigateResult<TRoute["fullPath"]>;
  }
}

// ---------------------------------------------------------------------------
// LazyRoute class
// ---------------------------------------------------------------------------

export class LazyRoute<TRoute extends AnyRoute> {
  options: { id: string } & LazyRouteOptions;

  constructor(opts: { id: string } & LazyRouteOptions) {
    this.options = opts;
  }

  useMatch: UseMatchRoute<TRoute["id"]> = (opts) => {
    return useMatch({
      select: opts?.select,
      from: this.options.id,
    } as any) as any;
  };

  useRouteContext: UseRouteContextRoute<TRoute["id"]> = (opts) => {
    return useMatch({
      from: this.options.id,
      select: (d: any) => (opts?.select ? opts.select(d.context) : d.context),
    }) as any;
  };

  useSearch: UseSearchRoute<TRoute["id"]> = (opts) => {
    return useSearch({
      select: opts?.select,
      from: this.options.id,
    } as any) as any;
  };

  useParams: UseParamsRoute<TRoute["id"]> = (opts) => {
    return useParams({
      select: opts?.select,
      from: this.options.id,
    } as any) as any;
  };

  useLoaderDeps: UseLoaderDepsRoute<TRoute["id"]> = (opts) => {
    return useLoaderDeps({ ...opts, from: this.options.id } as any);
  };

  useLoaderData: UseLoaderDataRoute<TRoute["id"]> = (opts) => {
    return useLoaderData({ ...opts, from: this.options.id } as any);
  };

  useNavigate = (): UseNavigateResult<TRoute["fullPath"]> => {
    const router = useRouter();
    return useNavigate({
      from: router.routesById[this.options.id].fullPath,
    });
  };
}

// ---------------------------------------------------------------------------
// createLazyFileRoute
// ---------------------------------------------------------------------------

/**
 * Creates a lazy file route — used for code-split routes that load on demand.
 */
export function createLazyFileRoute<
  TFilePath extends keyof FileRoutesByPath,
  TRoute extends FileRoutesByPath[TFilePath]["preLoaderRoute"] =
    FileRoutesByPath[TFilePath]["preLoaderRoute"],
>(id: TFilePath): (opts: LazyRouteOptions) => LazyRoute<TRoute> {
  // Object form: createLazyFileRoute({ component, ... })
  if (typeof id === "object") {
    return new LazyRoute<TRoute>(id) as any;
  }

  return (opts: LazyRouteOptions) => new LazyRoute<TRoute>({ id, ...opts });
}

// ---------------------------------------------------------------------------
// createLazyRoute
// ---------------------------------------------------------------------------

/**
 * Creates a lazy route by ID — used for code-split routes.
 */
export function createLazyRoute<
  TRouter extends AnyRouter = RegisteredRouter,
  TId extends string = string,
  TRoute extends AnyRoute = RouteById<TRouter["routeTree"], TId>,
>(id: ConstrainLiteral<TId, RouteIds<TRouter["routeTree"]>>) {
  return (opts: LazyRouteOptions) => {
    return new LazyRoute<TRoute>({
      id: id as string,
      ...opts,
    });
  };
}
