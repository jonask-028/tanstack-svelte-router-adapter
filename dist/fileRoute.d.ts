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
import type { AnyRoute, AnyRouter, RouteConstraints, FileRoutesByPath, LazyRouteOptions, RegisteredRouter, RouteById, RouteIds, ConstrainLiteral, UseNavigateResult } from "@tanstack/router-core";
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
/**
 * @deprecated Use `createFileRoute(path)(options)` instead.
 */
export declare class FileRoute<TFilePath extends keyof FileRoutesByPath, TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]["parentRoute"], TId extends RouteConstraints["TId"] = FileRoutesByPath[TFilePath]["id"], TPath extends RouteConstraints["TPath"] = FileRoutesByPath[TFilePath]["path"], TFullPath extends RouteConstraints["TFullPath"] = FileRoutesByPath[TFilePath]["fullPath"]> {
    path?: TFilePath | undefined;
    silent?: boolean;
    constructor(path?: TFilePath | undefined, _opts?: {
        silent: boolean;
    });
    createRoute: (options?: any) => any;
}
/**
 * Creates a file-based route factory bound to a specific path.
 *
 * Handles both the standard string form and the object form used by
 * virtual file-based routes:
 * - `createFileRoute('/path')(options)` — standard
 * - `createFileRoute({ component: ... })` — virtual (object arg)
 */
export declare function createFileRoute<TFilePath extends keyof FileRoutesByPath, TParentRoute extends AnyRoute = FileRoutesByPath[TFilePath]["parentRoute"], TId extends RouteConstraints["TId"] = FileRoutesByPath[TFilePath]["id"], TPath extends RouteConstraints["TPath"] = FileRoutesByPath[TFilePath]["path"], TFullPath extends RouteConstraints["TFullPath"] = FileRoutesByPath[TFilePath]["fullPath"]>(path?: TFilePath): FileRoute<TFilePath, TParentRoute, TId, TPath, TFullPath>["createRoute"];
declare module "@tanstack/router-core" {
    interface LazyRoute<in out TRoute extends AnyRoute> {
        useMatch: UseMatchRoute<TRoute["id"]>;
        useRouteContext: UseRouteContextRoute<TRoute["id"]>;
        useSearch: UseSearchRoute<TRoute["id"]>;
        useParams: UseParamsRoute<TRoute["id"]>;
        useLoaderDeps: UseLoaderDepsRoute<TRoute["id"]>;
        useLoaderData: UseLoaderDataRoute<TRoute["id"]>;
        useNavigate: () => UseNavigateResult<TRoute["fullPath"]>;
    }
}
export declare class LazyRoute<TRoute extends AnyRoute> {
    options: {
        id: string;
    } & LazyRouteOptions;
    constructor(opts: {
        id: string;
    } & LazyRouteOptions);
    useMatch: UseMatchRoute<TRoute["id"]>;
    useRouteContext: UseRouteContextRoute<TRoute["id"]>;
    useSearch: UseSearchRoute<TRoute["id"]>;
    useParams: UseParamsRoute<TRoute["id"]>;
    useLoaderDeps: UseLoaderDepsRoute<TRoute["id"]>;
    useLoaderData: UseLoaderDataRoute<TRoute["id"]>;
    useNavigate: () => UseNavigateResult<TRoute["fullPath"]>;
}
/**
 * Creates a lazy file route — used for code-split routes that load on demand.
 */
export declare function createLazyFileRoute<TFilePath extends keyof FileRoutesByPath, TRoute extends FileRoutesByPath[TFilePath]["preLoaderRoute"] = FileRoutesByPath[TFilePath]["preLoaderRoute"]>(id: TFilePath): (opts: LazyRouteOptions) => LazyRoute<TRoute>;
/**
 * Creates a lazy route by ID — used for code-split routes.
 */
export declare function createLazyRoute<TRouter extends AnyRouter = RegisteredRouter, TId extends string = string, TRoute extends AnyRoute = RouteById<TRouter["routeTree"], TId>>(id: ConstrainLiteral<TId, RouteIds<TRouter["routeTree"]>>): (opts: LazyRouteOptions) => LazyRoute<TRoute>;
export {};
//# sourceMappingURL=fileRoute.d.ts.map