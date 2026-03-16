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
// ---------------------------------------------------------------------------
// Route class
// ---------------------------------------------------------------------------
export class Route extends BaseRoute {
    /**
     * @deprecated Use the `createRoute` function instead.
     */
    constructor(options) {
        super(options);
    }
    useMatch = (opts) => {
        return useMatch({
            select: opts?.select,
            from: this.id,
        });
    };
    useRouteContext = (opts) => {
        return useMatch({
            ...opts,
            from: this.id,
            select: (d) => (opts?.select ? opts.select(d.context) : d.context),
        });
    };
    useSearch = (opts) => {
        return useSearch({
            select: opts?.select,
            from: this.id,
        });
    };
    useParams = (opts) => {
        return useParams({
            select: opts?.select,
            from: this.id,
        });
    };
    useLoaderDeps = (opts) => {
        return useLoaderDeps({ ...opts, from: this.id });
    };
    useLoaderData = (opts) => {
        return useLoaderData({ ...opts, from: this.id });
    };
    useNavigate = () => {
        return useNavigate({ from: this.fullPath });
    };
}
// ---------------------------------------------------------------------------
// RootRoute class
// ---------------------------------------------------------------------------
export class RootRoute extends BaseRootRoute {
    /**
     * @deprecated Use `createRootRoute()` instead.
     */
    constructor(options) {
        super(options);
    }
    useMatch = (opts) => {
        return useMatch({
            select: opts?.select,
            from: this.id,
        });
    };
    useRouteContext = (opts) => {
        return useMatch({
            ...opts,
            from: this.id,
            select: (d) => (opts?.select ? opts.select(d.context) : d.context),
        });
    };
    useSearch = (opts) => {
        return useSearch({
            select: opts?.select,
            from: this.id,
        });
    };
    useParams = (opts) => {
        return useParams({
            select: opts?.select,
            from: this.id,
        });
    };
    useLoaderDeps = (opts) => {
        return useLoaderDeps({ ...opts, from: this.id });
    };
    useLoaderData = (opts) => {
        return useLoaderData({ ...opts, from: this.id });
    };
    useNavigate = () => {
        return useNavigate({ from: this.fullPath });
    };
}
// ---------------------------------------------------------------------------
// createRoute factory
// ---------------------------------------------------------------------------
export function createRoute(options) {
    return new Route(options);
}
// ---------------------------------------------------------------------------
// createRootRoute factory
// ---------------------------------------------------------------------------
export function createRootRoute(options) {
    return new RootRoute(options);
}
// ---------------------------------------------------------------------------
// createRootRouteWithContext
// ---------------------------------------------------------------------------
export function createRootRouteWithContext() {
    return (options) => {
        return createRootRoute(options);
    };
}
/**
 * @deprecated Use the `createRootRouteWithContext` function instead.
 */
export const rootRouteWithContext = createRootRouteWithContext;
// ---------------------------------------------------------------------------
// NotFoundRoute class
// ---------------------------------------------------------------------------
export class NotFoundRoute extends Route {
    constructor(options) {
        super({
            ...options,
            id: "404",
        });
    }
}
// ---------------------------------------------------------------------------
// RouteApi class — typed route API with bound hook methods
// ---------------------------------------------------------------------------
export class RouteApi extends BaseRouteApi {
    /**
     * @deprecated Use the `getRouteApi` function instead.
     */
    constructor({ id }) {
        super({ id });
    }
    useMatch = (opts) => {
        return useMatch({
            select: opts?.select,
            from: this.id,
        });
    };
    useRouteContext = (opts) => {
        return useMatch({
            from: this.id,
            select: (d) => (opts?.select ? opts.select(d.context) : d.context),
        });
    };
    useSearch = (opts) => {
        return useSearch({
            select: opts?.select,
            from: this.id,
        });
    };
    useParams = (opts) => {
        return useParams({
            select: opts?.select,
            from: this.id,
        });
    };
    useLoaderDeps = (opts) => {
        return useLoaderDeps({ ...opts, from: this.id, strict: false });
    };
    useLoaderData = (opts) => {
        return useLoaderData({ ...opts, from: this.id, strict: false });
    };
    useNavigate = () => {
        const router = useRouter();
        return useNavigate({
            from: router.routesById[this.id].fullPath,
        });
    };
}
// ---------------------------------------------------------------------------
// getRouteApi
// ---------------------------------------------------------------------------
/**
 * Get a type-safe API for accessing route data outside of route components.
 */
export function getRouteApi(id) {
    return new RouteApi({ id });
}
