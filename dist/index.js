/**
 * @tanstack/svelte-router
 *
 * TanStack Router adapter for Svelte 5.
 * Provides router-aware components (Link, Outlet, RouterProvider),
 * navigation hooks, and SSR utilities.
 */
// ============================================================================
// Components
// ============================================================================
export { default as RouterProvider } from "./components/RouterProvider.svelte";
export { default as Link } from "./components/Link.svelte";
export { default as Outlet } from "./components/Outlet.svelte";
export { default as Navigate } from "./components/Navigate.svelte";
export { default as Match } from "./components/Match.svelte";
export { default as Matches } from "./components/Matches.svelte";
// ============================================================================
// Framework-specific classes & factories (Svelte adapter layer)
// ============================================================================
// Router
export { Router, createRouter } from "./router.js";
// Route definitions
export { Route, RootRoute, NotFoundRoute, RouteApi, createRoute, createRootRoute, createRootRouteWithContext, rootRouteWithContext, getRouteApi, } from "./route.js";
// File-based routing
export { FileRoute, LazyRoute, createFileRoute, createLazyFileRoute, createLazyRoute, } from "./fileRoute.js";
// Link utilities
export { linkOptions } from "./link.js";
// ============================================================================
// Hooks
// ============================================================================
export { useRouter } from "./hooks/useRouter.js";
export { useRouterState } from "./hooks/useRouterState.js";
export { useNavigate } from "./hooks/useNavigate.js";
export { useParams } from "./hooks/useParams.js";
export { useSearch } from "./hooks/useSearch.js";
export { useMatch } from "./hooks/useMatch.js";
export { useLocation } from "./hooks/useLocation.js";
export { useLoaderData } from "./hooks/useLoaderData.js";
export { useLoaderDeps } from "./hooks/useLoaderDeps.js";
export { useRouteContext } from "./hooks/useRouteContext.js";
export { useCanGoBack } from "./hooks/useCanGoBack.js";
export { useMatchRoute } from "./hooks/useMatchRoute.js";
// ============================================================================
// Context
// ============================================================================
export { ROUTER_CONTEXT_KEY, MATCH_CONTEXT_KEY } from "./context/keys.js";
export { getRouterContext, getMatchContext } from "./context/getContext.js";
// ============================================================================
// Re-exports from @tanstack/router-core (values)
// ============================================================================
export { 
// Route base classes (for advanced usage / extension)
BaseRoute, BaseRouteApi, BaseRootRoute, 
// Router core class
RouterCore, 
// Navigation
redirect, isRedirect, isResolvedRedirect, notFound, isNotFound, 
// Path utilities
joinPaths, cleanPath, trimPathLeft, trimPathRight, trimPath, resolvePath, interpolatePath, exactPathTest, removeTrailingSlash, 
// Search params
encode, decode, 
// Utilities
functionalUpdate, replaceEqualDeep, isPlainObject, isPlainArray, deepEqual, createControlledPromise, 
// Component types
componentTypes, lazyFn, SearchParamError, PathParamError, getInitialRouterState, defaultSerializeError, 
// Search middleware
retainSearchParams, stripSearchParams, 
// Match
isMatch, 
// Root route ID
rootRouteId, } from "@tanstack/router-core";
// ============================================================================
// Re-exports from @tanstack/history
// ============================================================================
export { createBrowserHistory, createHashHistory, createMemoryHistory, createHistory, } from "@tanstack/history";
