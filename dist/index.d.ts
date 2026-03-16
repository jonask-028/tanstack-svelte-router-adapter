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
export { default as CatchBoundary } from "./components/CatchBoundary.svelte";
export { default as CatchNotFound } from "./components/CatchNotFound.svelte";
export { default as ErrorComponent } from "./components/ErrorComponent.svelte";
export { default as DefaultGlobalNotFound } from "./components/DefaultGlobalNotFound.svelte";
export { default as Block } from "./components/Block.svelte";
export { default as Asset } from "./components/Asset.svelte";
export { default as HeadContent } from "./components/HeadContent.svelte";
export { default as Scripts } from "./components/Scripts.svelte";
export { default as ScriptOnce } from "./components/ScriptOnce.svelte";
export { default as ScrollRestoration } from "./components/ScrollRestoration.svelte";
export { default as Await } from "./components/Await.svelte";
export { default as ClientOnly } from "./components/ClientOnly.svelte";
export { default as MatchRoute } from "./components/MatchRoute.svelte";
export { Router, createRouter } from "./router.js";
export { Route, RootRoute, NotFoundRoute, RouteApi, createRoute, createRootRoute, createRootRouteWithContext, rootRouteWithContext, getRouteApi, createRouteMask, } from "./route.js";
export type { RouteComponent, ErrorRouteComponent, NotFoundRouteComponent, SyncRouteComponent, AnyRootRoute, } from "./route.js";
export { FileRoute, LazyRoute, createFileRoute, createLazyFileRoute, createLazyRoute, } from "./fileRoute.js";
export { linkOptions } from "./link.js";
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
export { useBlocker } from "./hooks/useBlocker.svelte.js";
export type { UseBlockerOpts, BlockerState, BlockerResolver, ShouldBlockFn, } from "./hooks/useBlocker.svelte.js";
export { useMatches } from "./hooks/useMatches.js";
export { useParentMatches } from "./hooks/useParentMatches.js";
export { useChildMatches } from "./hooks/useChildMatches.js";
export { useTags } from "./hooks/useTags.js";
export { useScrollRestoration, useElementScrollRestoration, } from "./hooks/useScrollRestoration.js";
export { useAwaited } from "./hooks/useAwaited.js";
export type { AwaitOptions } from "./hooks/useAwaited.js";
export { useHydrated } from "./hooks/useHydrated.js";
export { lazyRouteComponent } from "./lazyRouteComponent.js";
export { ROUTER_CONTEXT_KEY, MATCH_CONTEXT_KEY } from "./context/keys.js";
export { getRouterContext, getMatchContext } from "./context/getContext.js";
export { BaseRoute, BaseRouteApi, BaseRootRoute, RouterCore, redirect, isRedirect, isResolvedRedirect, notFound, isNotFound, joinPaths, cleanPath, trimPathLeft, trimPathRight, trimPath, resolvePath, interpolatePath, exactPathTest, removeTrailingSlash, encode, decode, functionalUpdate, replaceEqualDeep, isPlainObject, isPlainArray, deepEqual, createControlledPromise, lazyFn, SearchParamError, PathParamError, getInitialRouterState, defaultSerializeError, retainSearchParams, stripSearchParams, isMatch, rootRouteId, escapeHtml, setupScrollRestoration, defaultGetScrollRestorationKey, scrollRestorationCache, restoreScroll, handleHashScroll, getCssSelector, defer, TSR_DEFERRED_PROMISE, defaultParseSearch, defaultStringifySearch, parseSearchWith, stringifySearchWith, createSerializationAdapter, composeRewrites, isDangerousProtocol, getLocationChangeInfo, getMatchedRoutes, trailingSlashOptions, } from "@tanstack/router-core";
export type { Register, AnyRouter, RegisteredRouter, RouterOptions, RouterState, RouterEvents, RouterListener, ListenerFn, RouterContextOptions, TrailingSlashOption, BuildNextOptions, RouterConstructorOptions, CreateRouterFn, AnyRoute, RouteOptions, FileBaseRouteOptions, BaseRouteOptions, UpdatableRouteOptions, RouteContextOptions, RouteMask, RouteConstraints, StaticDataRouteOption, MetaDescriptor, RouteLinkEntry, RouteLoaderFn, LoaderFnContext, RootRouteOptions, RouteMatch, AnyRouteMatch, MatchRouteOptions, MakeRouteMatch, MakeRouteMatchUnion, ParseRoute, RoutesById, RouteById, RouteIds, RoutesByPath, RouteByPath, RoutePaths, FullSearchSchema, AllParams, AllLoaderData, FullSearchSchemaInput, AllContext, NavigateOptions, ToOptions, LinkOptions, ActiveOptions, ResolveRelativePath, SearchSchemaInput, AnySearchValidator, AnyPathParams, ResolveParams, AnyContext, ErrorComponentProps, NotFoundRouteProps, NotFoundError, ControlledPromise, StrictOrFrom, ParsedLocation, FileRoutesByPath, FileRouteTypes, LazyRouteOptions, CreateFileRoute as CreateFileRouteType, CreateLazyFileRoute as CreateLazyFileRouteType, Manifest, RouterManagedTag, Redirect, ResolvedRedirect, AnyRedirect, RootRouteId, ValidatorAdapter, AnyValidatorAdapter, AnyValidator, AnySchema, NavigateFn, BuildLocationFn, SSROption, ResolveFullPath, ResolveId, ScrollRestorationOptions, ScrollRestorationEntry, DeferredPromise, DeferredPromiseState, SearchSerializer, SearchParser, SerializationAdapter, AnySerializationAdapter, ValidatorFn, AnyValidatorFn, AnyValidatorObj, ValidatorObj, ResolveValidatorInput, ResolveValidatorOutput, DefaultValidator, RemoveTrailingSlashes, RemoveLeadingSlashes, TrimPath, TrimPathLeft, TrimPathRight, RouteContext, RouteContextFn, BeforeLoadContextOptions, ContextOptions, RouteContextParameter, BeforeLoadContextParameter, ResolveAllContext, ResolveRouteContext, ResolveLoaderData, ResolveOptionalParams, ResolveRequiredParams, ToSubOptions, ToMaskOptions, ToPathOption, SearchParamOptions, PathParamOptions, MakeOptionalPathParams, InferDescendantToPaths, RelativeToPath, RelativeToParentPath, RelativeToCurrentPath, AbsoluteToPath, RelativeToPathAutoComplete, InferFullSearchSchema, InferFullSearchSchemaInput, InferAllParams, InferAllContext, LooseReturnType, LooseAsyncReturnType, ContextReturnType, ContextAsyncReturnType, Constrain, Expand, MergeAll, Assign, IntersectAssign, AnyRouterWithContext, CommitLocationOptions, MatchLocation, ResolveFullSearchSchema, ResolveFullSearchSchemaInput, ResolveAllParamsFromParent, FullSearchSchemaOption, LocationRewrite, LocationRewriteFunction, ParseParamsFn, StringifyParamsFn, ParamsOptions, ErrorRouteProps, RoutePathOptions, RoutePathOptionsIntersection, UpdatableStaticRouteOption, SearchFilter, PreloadableObj, OptionalStructuralSharing, UseSearchResult, ResolveUseSearch, UseParamsResult, ResolveUseParams, UseNavigateResult, UseLoaderDepsResult, ResolveUseLoaderDeps, UseLoaderDataResult, ResolveUseLoaderData, RedirectOptions, ViewTransitionOptions, MatchRoutesOpts, RouterEvent, InjectedHtmlEntry, } from "@tanstack/router-core";
export { createBrowserHistory, createHashHistory, createMemoryHistory, createHistory, } from "@tanstack/history";
export type { RouterHistory, HistoryLocation, ParsedPath, HistoryState, BlockerFn, HistoryAction, BlockerFnArgs, } from "@tanstack/history";
//# sourceMappingURL=index.d.ts.map