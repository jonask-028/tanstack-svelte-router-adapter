# TanStack Router + Svelte Adapter

A comprehensive adapter that enables **Svelte 5** as a rendering framework for [TanStack Router](https://tanstack.com/router). Use TanStack Router's powerful client-side routing — type-safe navigation, file-based routing, loaders, search params, code splitting — with Svelte 5's runes and component model instead of React.

## Architecture

```text
┌─────────────────────────────────────────────────┐
│                  Your App                       │
│  .svelte routes + router.ts + routeTree.gen.ts  │
├─────────────────────────────────────────────────┤
│           @tanstack/svelte-router               │
│  Components · Hooks · Context · SSR rendering   │
├─────────────────────────────────────────────────┤
│           @tanstack/router-core                 │
│  Route tree · Matching · History · Loaders      │
└─────────────────────────────────────────────────┘
```

This mirrors the architecture of TanStack Router's official React and Solid adapters — a thin Svelte binding layer on top of the framework-agnostic router core.

## Quick Start

### 1. Install

```bash
bun add @tanstack/svelte-router @tanstack/router-core @tanstack/history svelte
bun add -D @sveltejs/vite-plugin-svelte vite typescript
```

### 2. Define Routes

```ts
// src/routes/__root.ts
import { createRootRoute } from "@tanstack/svelte-router";
import Root from "./__root.svelte";

export const Route = createRootRoute({
  component: Root,
});
```

```svelte
<!-- src/routes/__root.svelte -->
<script lang="ts">
  import { Link, Outlet, HeadContent, ScrollRestoration } from '@tanstack/svelte-router'
</script>

<HeadContent />
<nav>
  <Link to="/">Home</Link>
  <Link to="/about">About</Link>
</nav>
<Outlet />
<ScrollRestoration />
```

```ts
// src/routes/index.ts
import { createFileRoute } from "@tanstack/svelte-router";
import Home from "./index.svelte";

export const Route = createFileRoute("/")({
  component: Home,
});
```

```svelte
<!-- src/routes/index.svelte -->
<script lang="ts">
  let count = $state(0)
</script>

<h1>Hello TanStack Router + Svelte!</h1>
<button onclick={() => count++}>Count: {count}</button>
```

### 3. Create Router

```ts
// src/router.ts
import { createRouter } from "@tanstack/svelte-router";
import { routeTree } from "./routeTree.gen";

export function createAppRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
  });
}

declare module "@tanstack/svelte-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
```

### 4. Mount the App

```svelte
<!-- src/App.svelte -->
<script lang="ts">
  import { RouterProvider } from '@tanstack/svelte-router'
  import { createAppRouter } from './router'

  const router = createAppRouter()
</script>

<RouterProvider {router} />
```

## Route Loaders

Define loaders on routes to fetch data before rendering:

```ts
// src/routes/users.ts
import { createFileRoute } from "@tanstack/svelte-router";
import Users from "./users.svelte";

export const Route = createFileRoute("/users")({
  loader: async () => {
    const res = await fetch("/api/users");
    return res.json();
  },
  component: Users,
});
```

Access in components:

```svelte
<!-- src/routes/users.svelte -->
<script lang="ts">
  import { useLoaderData } from '@tanstack/svelte-router'

  let users = $derived(useLoaderData({ from: '/users' }))
</script>

{#each users as user}
  <p>{user.name}</p>
{/each}
```

## Components

### `<RouterProvider>`

Root component that provides the router context to all child components. Handles history subscription, router lifecycle events, URL canonicalization, and hash scroll.

```svelte
<script lang="ts">
  import { RouterProvider } from '@tanstack/svelte-router'
  let { router } = $props()
</script>

<RouterProvider {router} />
```

### `<Link>`

Type-safe navigation link with preloading, active state detection, and accessible attributes.

```svelte
<Link to="/users/$userId" params={{ userId: '123' }} activeProps={{ class: 'active' }}>
  View User
</Link>

<!-- Render prop for active/transitioning state -->
<Link to="/about">
  {#snippet children({ isActive, isTransitioning })}
    <span class:font-bold={isActive}>About</span>
  {/snippet}
</Link>
```

**Props**: `to`, `from`, `params`, `search`, `hash`, `state`, `mask`, `replace`, `resetScroll`, `viewTransition`, `preload`, `preloadDelay`, `activeProps`, `inactiveProps`, `activeOptions`, `target`, `disabled`, `reloadDocument`, `ignoreBlocker`

### `<Outlet>`

Renders the child route component within layout routes.

```svelte
<nav><!-- navigation --></nav>
<Outlet />
```

### `<Navigate>`

Imperative redirect — navigates on mount.

```svelte
{#if !isAuthenticated}
  <Navigate to="/login" />
{/if}
```

### `<HeadContent>`

Renders route-managed head tags (`<title>`, `<meta>`, `<link>`, `<style>`) into `<svelte:head>`.

```svelte
<HeadContent />
```

### `<Await>`

Renders deferred/async data with a pending fallback. Compatible with TanStack Router's `defer()` utility.

```svelte
<Await promise={data.someDeferred}>
  {#snippet children(result)}
    <p>{result.name}</p>
  {/snippet}
  {#snippet fallback()}
    <p>Loading...</p>
  {/snippet}
</Await>
```

### `<Block>`

Declarative navigation blocking. Wraps `useBlocker` as a component.

```svelte
<Block shouldBlockFn={() => formDirty} withResolver={true}>
  {#snippet children({ status, proceed, reset })}
    {#if status === 'blocked'}
      <dialog open>
        <p>Leave page? Unsaved changes will be lost.</p>
        <button onclick={proceed}>Leave</button>
        <button onclick={reset}>Stay</button>
      </dialog>
    {/if}
  {/snippet}
</Block>
```

### `<MatchRoute>`

Conditionally renders children when a route matches the current location.

```svelte
<MatchRoute to="/posts/$postId" params={{ postId: '123' }}>
  {#snippet children(match)}
    <span>Post 123 is active!</span>
  {/snippet}
</MatchRoute>
```

### `<ClientOnly>`

Renders children only on the client (after hydration). Shows an optional fallback during SSR.

```svelte
<ClientOnly>
  {#snippet children()}
    <canvas id="webgl-canvas" />
  {/snippet}
  {#snippet fallback()}
    <div>Loading canvas...</div>
  {/snippet}
</ClientOnly>
```

### `<CatchBoundary>`

Error boundary for Svelte 5. Used internally by `Match` to wrap each route, but can also be used directly.

### `<CatchNotFound>`

Catches `notFound()` throws from child components and renders a fallback not-found component.

### `<ScrollRestoration>`

Enables automatic scroll restoration. **Deprecated** — use `createRouter({ scrollRestoration: true })` instead.

### `<Scripts>`

Renders body script tags collected from route matches and SSR manifests. Place near the end of your document body.

### `<ScriptOnce>`

SSR-only helper to emit a `<script>` tag exactly once that self-removes after execution.

## Hooks

All hooks must be called during component initialization (in the `<script>` block). For reactivity, wrap hook calls in `$derived()`:

```svelte
<script lang="ts">
  let location = $derived(useLocation())
  let params = $derived(useParams({ from: '/users/$id' }))
</script>
```

| Hook                                | Description                                          |
| ----------------------------------- | ---------------------------------------------------- |
| `useRouter()`                       | Access the router instance                           |
| `useRouterState(opts)`              | Subscribe to router state with a selector            |
| `useNavigate(opts?)`                | Get a navigate function                              |
| `useParams(opts)`                   | Access route params (typed when `from` is specified) |
| `useSearch(opts)`                   | Access validated search/query params                 |
| `useMatch(opts)`                    | Access the current route match                       |
| `useLoaderData(opts)`               | Access loader data for a route                       |
| `useLoaderDeps(opts)`               | Access loader deps for a route                       |
| `useLocation()`                     | Access the current parsed location                   |
| `useRouteContext(opts)`             | Access route context data                            |
| `useCanGoBack()`                    | Check if history allows going back                   |
| `useMatchRoute()`                   | Get a function to check if a path matches            |
| `useMatches()`                      | Access all current route matches                     |
| `useParentMatches()`                | Access parent route matches                          |
| `useChildMatches()`                 | Access child route matches                           |
| `useBlocker(opts)`                  | Block navigation with a confirmation resolver        |
| `useAwaited(opts)`                  | Consume a deferred promise synchronously             |
| `useHydrated()`                     | Returns `true` once mounted on the client            |
| `useTags()`                         | Access route-managed head tags                       |
| `useScrollRestoration()`            | Enable scroll restoration (internal)                 |
| `useElementScrollRestoration(opts)` | Track/restore scroll position for a specific element |

### Hook Examples

**Imperative navigation:**

```svelte
<script lang="ts">
  import { useNavigate } from '@tanstack/svelte-router'
  const navigate = useNavigate()

  function goToOrgs() {
    navigate({ to: '/orgs' })
  }
</script>
```

**Navigation blocking:**

```svelte
<script lang="ts">
  import { useBlocker } from '@tanstack/svelte-router'

  let formDirty = $state(false)
  const blocker = useBlocker({
    shouldBlockFn: () => formDirty,
    withResolver: true,
  })
</script>

{#if blocker.status === 'blocked'}
  <dialog open>
    <p>Unsaved changes! Leave anyway?</p>
    <button onclick={blocker.proceed}>Leave</button>
    <button onclick={blocker.reset}>Stay</button>
  </dialog>
{/if}
```

**Route matching:**

```svelte
<script lang="ts">
  import { useMatchRoute } from '@tanstack/svelte-router'
  const matchRoute = useMatchRoute()
  let isOnOrgs = $derived(matchRoute({ to: '/orgs' }))
</script>
```

## Utilities

### `linkOptions`

Type-check a link options object literal. Returns the same object with inferred types for use with `<Link>`.

```ts
import { linkOptions } from "@tanstack/svelte-router";

const opts = linkOptions({
  to: "/posts/$postId",
  params: { postId: "123" },
});

// In a component:
// <Link {...opts}>Post 123</Link>
```

### `lazyRouteComponent`

Create a lazy-loaded route component from a dynamic import for code splitting.

```ts
import { createRoute, lazyRouteComponent } from "@tanstack/svelte-router";

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: lazyRouteComponent(() => import("./pages/About.svelte")),
});
```

### `getRouteApi`

Get a type-safe API for accessing route data outside of route components.

```ts
import { getRouteApi } from "@tanstack/svelte-router";

const routeApi = getRouteApi("/users/$id");
// routeApi.useParams(), routeApi.useLoaderData(), etc.
```

## File-Based Routing

The adapter supports TanStack Router's file-based routing via `createFileRoute` and `createLazyFileRoute`.

### Standard file routes

```ts
// src/routes/about.ts (generated by tsr generate / tsr watch)
import { createFileRoute } from "@tanstack/svelte-router";

export const Route = createFileRoute("/about")({
  component: () => import("./about.svelte"),
});
```

### Lazy routes (code splitting)

```ts
// src/routes/about.lazy.ts
import { createLazyFileRoute } from "@tanstack/svelte-router";

export const Route = createLazyFileRoute("/about")({
  component: () => import("./about.svelte"),
});
```

The adapter registers `createFileRoute` and `createLazyFileRoute` on `globalThis` so the TanStack Router code generator (`tsr generate` / `tsr watch`) can resolve them at module-load time.

## SSR

The adapter provides SSR utilities via separate entry points:

### Server

```ts
import {
  renderRouterToString,
  renderRouterToStream,
} from "@tanstack/svelte-router/ssr/server";
```

| Function               | Description                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `renderRouterToString` | Renders to a complete HTML string Response                                              |
| `renderRouterToStream` | Renders to a streaming Response (wraps Svelte's synchronous render in a ReadableStream) |

### Client

```ts
import { hydrate, mount } from "@tanstack/svelte-router/ssr/client";
```

Re-exports Svelte's `hydrate` and `mount` functions for client-side hydration.

## Context API

The adapter uses Svelte's native `setContext` / `getContext` for router context propagation:

| Key                  | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `ROUTER_CONTEXT_KEY` | Router instance (set by `RouterProvider`)                  |
| `MATCH_CONTEXT_KEY`  | Current match ID getter (set by `Match`, read by `Outlet`) |
| `ROUTER_STATE_KEY`   | Reactive state getter for `$derived` reactivity            |

You can access these directly for advanced use cases:

```ts
import { getRouterContext, getMatchContext } from "@tanstack/svelte-router";
```

## Project Structure

```text
src/
  components/           # Svelte 5 components
    RouterProvider.svelte   # Root context provider + Transitioner
    Link.svelte             # Type-safe navigation link
    Outlet.svelte           # Child route renderer
    Match.svelte            # Single route match renderer (recursive)
    Matches.svelte          # Match tree entry point
    Navigate.svelte         # Imperative redirect
    Await.svelte            # Deferred data renderer
    Block.svelte            # Navigation blocker
    MatchRoute.svelte       # Conditional route matching
    CatchBoundary.svelte    # Error boundary
    CatchNotFound.svelte    # Not-found boundary
    ErrorComponent.svelte   # Default error UI
    DefaultGlobalNotFound.svelte  # Default 404 UI
    HeadContent.svelte      # Route-managed <head> tags
    Scripts.svelte          # Body script tags
    ScriptOnce.svelte       # One-shot SSR script
    ScrollRestoration.svelte # Scroll restoration (deprecated)
    Asset.svelte            # Asset tag renderer
    ClientOnly.svelte       # Client-only rendering
  hooks/                # Navigation & state hooks
    useRouter.ts            # Router instance access
    useRouterState.ts       # Reactive state selector
    useNavigate.ts          # Imperative navigation
    useMatch.ts             # Route match access
    useParams.ts            # Route params
    useSearch.ts            # Search params
    useLoaderData.ts        # Loader data
    useLoaderDeps.ts        # Loader deps
    useLocation.ts          # Parsed location
    useRouteContext.ts      # Route context
    useCanGoBack.ts         # History check
    useMatchRoute.ts        # Route matching
    useMatches.ts           # All matches
    useParentMatches.ts     # Parent matches
    useChildMatches.ts      # Child matches
    useBlocker.svelte.ts    # Navigation blocking
    useAwaited.ts           # Deferred data
    useHydrated.ts          # Client hydration check
    useTags.ts              # Head tags
    useScrollRestoration.ts # Scroll restoration
  context/              # Router context (Svelte setContext/getContext)
    keys.ts                 # Context key constants
    getContext.ts           # Context getters
  ssr/                  # Server rendering & client hydration
    server.ts               # renderRouterToString, renderRouterToStream
    client.ts               # Re-exports hydrate, mount from svelte
  router.ts             # Router class extending RouterCore
  route.ts              # Route, RootRoute, RouteApi classes
  fileRoute.ts          # File-based routing (FileRoute, LazyRoute)
  link.ts               # linkOptions utility
  lazyRouteComponent.ts # Lazy-loaded component wrapper
  index.ts              # Main barrel export
```

## Key Design Decisions

1. **Runes-based Reactivity**: All hooks use Svelte 5's `$state` and `$derived` runes. Hooks should be wrapped in `$derived()` for reactive updates — not stores or legacy `$:` syntax.

2. **Context API**: Uses Svelte's native `setContext`/`getContext` instead of React's Context.Provider pattern. A reactive `$state` getter is stored in context so `$derived()` calls in descendant components automatically track router state changes.

3. **Synchronous SSR**: Svelte 5's `render()` is synchronous (unlike React's streaming SSR). Streaming is achieved at the data level via the router's dehydration system.

4. **Recursive Match Rendering**: The `Match` component handles recursive route tree rendering, wrapping each match in `CatchBoundary` and `CatchNotFound` boundaries.

5. **Transitioner Pattern**: `RouterProvider` includes a built-in Transitioner (ported from the React adapter) that subscribes to history, triggers `router.load()`, emits lifecycle events (`onLoad`, `onBeforeRouteMount`, `onResolved`), handles hash scroll, and canonicalizes URLs.

6. **Module Augmentation**: The adapter extends `@tanstack/router-core` interfaces (`RouterOptionsExtensions`, `UpdatableRouteOptionsExtensions`, `RouteExtensions`) with Svelte component types, enabling type-safe route component options.

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Type check
bun run typecheck

# Run tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## Status

This adapter is **experimental**. It mirrors the architecture of TanStack Router's official Solid and Vue adapters and targets feature parity with the React adapter.

### Not Yet Implemented

- [ ] Code splitting for route components (lazy loading infrastructure exists but is not fully wired)
- [ ] `<script module>` co-located route config (Svelte-specific pattern)
- [ ] View transitions API integration
- [ ] Full middleware support
- [ ] Hot Module Replacement for routes

## License

MIT
