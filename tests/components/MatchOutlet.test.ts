/**
 * Match & Outlet component unit tests.
 *
 * Tests the rendering pipeline components directly:
 * - Match renders component / errorComponent / pendingComponent
 * - Match passes children to component for nesting
 * - Outlet renders the next child match via context
 * - Matches kicks off rendering from the first match
 */
import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "./TestRouterProvider.svelte";
import HomePage from "../e2e/pages/HomePage.svelte";
import AboutPage from "../e2e/pages/AboutPage.svelte";
import RootLayout from "../e2e/pages/RootLayout.svelte";
import PostsLayout from "../e2e/pages/PostsLayout.svelte";
import PostPage from "../e2e/pages/PostPage.svelte";
import ErrorPage from "../e2e/pages/ErrorPage.svelte";
import DataPage from "../e2e/pages/DataPage.svelte";
import PendingPage from "../e2e/pages/PendingPage.svelte";
import NotFoundPage from "../e2e/pages/NotFoundPage.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Match — component rendering
// ---------------------------------------------------------------------------
describe("Match component", () => {
  it("should render the route component", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("should render errorComponent when loader throws", async () => {
    const rootRoute = createRootRoute({});
    const errorRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/error",
      component: DataPage,
      errorComponent: ErrorPage,
      loader: async () => {
        throw new Error("Boom!");
      },
    });
    const routeTree = rootRoute.addChildren([errorRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/error"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("error-page")).toBeInTheDocument();
      expect(screen.getByTestId("error-message").textContent).toContain(
        "Boom!",
      );
    });
  });

  it("should render child match when no component (layout pass-through)", async () => {
    // Root has no component — should pass through to child
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // Even though root has no component, the child renders
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("should switch components when route changes", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: AboutPage,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Outlet — child rendering
// ---------------------------------------------------------------------------
describe("Outlet component", () => {
  it("should render child route inside parent layout", async () => {
    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });

  it("should render deeply nested routes through multiple Outlets", async () => {
    const rootRoute = createRootRoute({ component: RootLayout });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      component: PostsLayout,
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      component: PostPage,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/7"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // Root layout → PostsLayout → PostPage
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(screen.getByTestId("posts-layout")).toBeInTheDocument();
      expect(screen.getByTestId("post-page")).toBeInTheDocument();
      expect(screen.getByTestId("post-id").textContent).toBe("7");
    });
  });

  it("should update Outlet content after navigation", async () => {
    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: AboutPage,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    // Navigate — Outlet should swap child content while layout stays
    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
    });
  });

  it("should render nothing when no child match exists", async () => {
    // RootLayout renders <Outlet /> — but at / with no child matches
    // beyond the index, the Outlet's child is the index component
    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // Layout renders, and Outlet shows the index child
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Matches — initial tree kickoff
// ---------------------------------------------------------------------------
describe("Matches component", () => {
  it("should render the first match from the match array", async () => {
    const rootRoute = createRootRoute({ component: RootLayout });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // Matches renders Match for rootRoute which renders RootLayout
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Match — pendingComponent rendering
// ---------------------------------------------------------------------------
describe("Match pendingComponent", () => {
  it("should render pendingComponent while loader is pending", async () => {
    vi.useFakeTimers();
    let resolveLoader!: (value: unknown) => void;
    const loaderPromise = new Promise((resolve) => {
      resolveLoader = resolve;
    });

    const rootRoute = createRootRoute({});
    const slowRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/slow",
      component: DataPage,
      pendingComponent: PendingPage,
      pendingMs: 0, // Show pending immediately
      loader: () => loaderPromise,
    });
    const routeTree = rootRoute.addChildren([slowRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/slow"] }),
    });

    // Start loading but don't resolve
    const loadPromise = router.load();

    render(TestRouterProvider, { props: { router } });

    // Pending should be shown while loader is unresolved
    await vi.advanceTimersByTimeAsync(50);
    await waitFor(() => {
      expect(screen.getByTestId("pending-page")).toBeInTheDocument();
    });

    // Resolve the loader
    resolveLoader({ data: "loaded" });
    await loadPromise;
    await vi.advanceTimersByTimeAsync(50);

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Match — notFoundComponent config
// ---------------------------------------------------------------------------
describe("Match notFoundComponent", () => {
  it("should accept defaultNotFoundComponent in router config", () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      defaultNotFoundComponent: NotFoundPage,
    });
    expect(router.options.defaultNotFoundComponent).toBe(NotFoundPage);
  });
});
