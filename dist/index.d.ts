/**
 * @tanstack/svelte-router
 *
 * TanStack Router adapter for Svelte 5.
 * Provides router-aware components (Link, Outlet, RouterProvider),
 * navigation hooks, and SSR utilities.
 */
export { default as RouterProvider } from "./components/RouterProvider.svelte";
export { default as Link } from "./components/Link.svelte";
export { default as Outlet } from "./components/Outlet.svelte";
export { default as Navigate } from "./components/Navigate.svelte";
export { default as Match } from "./components/Match.svelte";
export { default as Matches } from "./components/Matches.svelte";
export { Router, createRouter } from "./router.js";
export { Route, RootRoute, NotFoundRoute, RouteApi, createRoute, createRootRoute, createRootRouteWithContext, rootRouteWithContext, getRouteApi, } from "./route.js";
export type { RouteComponent, ErrorRouteComponent, NotFoundRouteComponent, SyncRouteComponent, AnyRootRoute, } from "./route.js";
export { FileRoute, LazyRoute, createFileRoute, createLazyFileRoute, createLazyRoute, } from "./fileRoute.js";
export { linkOptions } from "./link.js";
export { useRouter } from "./hooks/useRouter.js";
export { useRouterState } from "./hooks/useRouterState.js";
export { useNavigate } from "./hooks/useNavigate.js";
export type { UseNavigateResult } from "./hooks/useNavigate.js";
export { useParams } from "./hooks/useParams.js";
export { useSearch } from "./hooks/useSearch.js";
export { useMatch } from "./hooks/useMatch.js";
export { useLocation } from "./hooks/useLocation.js";
export { useLoaderData } from "./hooks/useLoaderData.js";
export { useLoaderDeps } from "./hooks/useLoaderDeps.js";
export { useRouteContext } from "./hooks/useRouteContext.js";
export { useCanGoBack } from "./hooks/useCanGoBack.js";
export { useMatchRoute } from "./hooks/useMatchRoute.js";
export { ROUTER_CONTEXT_KEY, MATCH_CONTEXT_KEY } from "./context/keys.js";
export { getRouterContext, getMatchContext } from "./context/getContext.js";
export { BaseRoute, BaseRouteApi, BaseRootRoute, RouterCore, redirect, isRedirect, isResolvedRedirect, notFound, isNotFound, joinPaths, cleanPath, trimPathLeft, trimPathRight, trimPath, resolvePath, interpolatePath, exactPathTest, removeTrailingSlash, encode, decode, functionalUpdate, replaceEqualDeep, isPlainObject, isPlainArray, deepEqual, createControlledPromise, componentTypes, lazyFn, SearchParamError, PathParamError, getInitialRouterState, defaultSerializeError, retainSearchParams, stripSearchParams, isMatch, rootRouteId, } from "@tanstack/router-core";
export type { Register, AnyRouter, RegisteredRouter, RouterOptions, RouterState, RouterEvents, RouterListener, ListenerFn, RouterContextOptions, TrailingSlashOption, BuildNextOptions, RouterConstructorOptions, CreateRouterFn, AnyRoute, RouteOptions, FileBaseRouteOptions, BaseRouteOptions, UpdatableRouteOptions, RouteContextOptions, RouteMask, RouteConstraints, StaticDataRouteOption, MetaDescriptor, RouteLinkEntry, RouteLoaderFn, LoaderFnContext, RootRouteOptions, RouteMatch, AnyRouteMatch, MatchRouteOptions, MakeRouteMatch, MakeRouteMatchUnion, ParseRoute, RoutesById, RouteById, RouteIds, RoutesByPath, RouteByPath, RoutePaths, FullSearchSchema, AllParams, AllLoaderData, FullSearchSchemaInput, AllContext, NavigateOptions, ToOptions, LinkOptions, ActiveOptions, ResolveRelativePath, SearchSchemaInput, AnySearchValidator, AnyPathParams, ResolveParams, AnyContext, ErrorComponentProps, NotFoundRouteProps, NotFoundError, ControlledPromise, StrictOrFrom, ParsedLocation, FileRoutesByPath, FileRouteTypes, LazyRouteOptions, CreateFileRoute as CreateFileRouteType, CreateLazyFileRoute as CreateLazyFileRouteType, Manifest, RouterManagedTag, Redirect, ResolvedRedirect, AnyRedirect, RootRouteId, ValidatorAdapter, AnyValidatorAdapter, AnyValidator, AnySchema, NavigateFn, BuildLocationFn, SSROption, ResolveFullPath, ResolveId, } from "@tanstack/router-core";
export { createBrowserHistory, createHashHistory, createMemoryHistory, createHistory, } from "@tanstack/history";
export type { RouterHistory, HistoryLocation, ParsedPath, HistoryState, BlockerFn, } from "@tanstack/history";
//# sourceMappingURL=index.d.ts.map