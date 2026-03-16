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
// ---------------------------------------------------------------------------
// FileRoute class
// ---------------------------------------------------------------------------
/**
 * @deprecated Use `createFileRoute(path)(options)` instead.
 */
export class FileRoute {
    path;
    silent;
    constructor(path, _opts) {
        this.path = path;
        this.silent = _opts?.silent;
    }
    createRoute = (options) => {
        const route = createRoute(options);
        route.isRoot = false;
        return route;
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
export function createFileRoute(path) {
    // Object form: createFileRoute({ component, ... }) — used by virtual routes
    if (typeof path === "object") {
        return new FileRoute(path, {
            silent: true,
        }).createRoute(path);
    }
    return new FileRoute(path, {
        silent: true,
    }).createRoute;
}
// ---------------------------------------------------------------------------
// LazyRoute class
// ---------------------------------------------------------------------------
export class LazyRoute {
    options;
    constructor(opts) {
        this.options = opts;
    }
    useMatch = (opts) => {
        return useMatch({
            select: opts?.select,
            from: this.options.id,
        });
    };
    useRouteContext = (opts) => {
        return useMatch({
            from: this.options.id,
            select: (d) => (opts?.select ? opts.select(d.context) : d.context),
        });
    };
    useSearch = (opts) => {
        return useSearch({
            select: opts?.select,
            from: this.options.id,
        });
    };
    useParams = (opts) => {
        return useParams({
            select: opts?.select,
            from: this.options.id,
        });
    };
    useLoaderDeps = (opts) => {
        return useLoaderDeps({ ...opts, from: this.options.id });
    };
    useLoaderData = (opts) => {
        return useLoaderData({ ...opts, from: this.options.id });
    };
    useNavigate = () => {
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
export function createLazyFileRoute(id) {
    // Object form: createLazyFileRoute({ component, ... })
    if (typeof id === "object") {
        return new LazyRoute(id);
    }
    return (opts) => new LazyRoute({ id, ...opts });
}
// ---------------------------------------------------------------------------
// createLazyRoute
// ---------------------------------------------------------------------------
/**
 * Creates a lazy route by ID — used for code-split routes.
 */
export function createLazyRoute(id) {
    return (opts) => {
        return new LazyRoute({
            id: id,
            ...opts,
        });
    };
}
