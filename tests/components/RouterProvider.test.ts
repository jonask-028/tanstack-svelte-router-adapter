/**
 * RouterProvider component tests.
 *
 * Tests:
 * - Renders matched route components into the DOM
 * - Updates rendered DOM content when router state changes (navigation)
 * - Renders loader data in route components
 * - Renders deeply nested routes through Outlet chain
 * - Renders defaultNotFoundComponent for unmatched routes
 * - Provides router and state context to descendant components
 * - Cleans up subscriptions on unmount
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "./TestRouterProvider.svelte";
import HomePage from "../e2e/pages/HomePage.svelte";
import AboutPage from "../e2e/pages/AboutPage.svelte";
import RootLayout from "../e2e/pages/RootLayout.svelte";
import DataPage from "../e2e/pages/DataPage.svelte";
import PostsLayout from "../e2e/pages/PostsLayout.svelte";
import PostPage from "../e2e/pages/PostPage.svelte";
import NotFoundPage from "../e2e/pages/NotFoundPage.svelte";
import ContextHarness from "../unit/harnesses/ContextHarness.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------
describe("RouterProvider rendering", () => {
  it("should render matched route component into the DOM", async () => {
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
      expect(
        screen.getByRole("heading", { name: "Home Page" }),
      ).toBeInTheDocument();
    });
  });

  it("should render layout with Outlet and child route", async () => {
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
});

// ---------------------------------------------------------------------------
// Navigation — DOM updates
// ---------------------------------------------------------------------------
describe("RouterProvider navigation", () => {
  it("should update rendered content when navigating to a new route", async () => {
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

    // Initially renders home
    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    // Navigate to about
    await router.navigate({ to: "/about" });
    await router.invalidate();

    // DOM should now show about page, not home page
    await waitFor(() => {
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
      expect(screen.queryByTestId("home-page")).not.toBeInTheDocument();
      expect(screen.getByTestId("layout-pathname").textContent).toBe("/about");
    });
  });
});

// ---------------------------------------------------------------------------
// Loaders — data rendered in DOM
// ---------------------------------------------------------------------------
describe("RouterProvider with loaders", () => {
  it("should render loader data in route component", async () => {
    const rootRoute = createRootRoute({});
    const dataRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/data",
      component: DataPage,
      loader: async () => ({ message: "Hello from loader", count: 42 }),
    });
    const routeTree = rootRoute.addChildren([dataRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/data"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByText("Hello from loader")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Deeply nested routes
// ---------------------------------------------------------------------------
describe("RouterProvider nested routes", () => {
  it("should render deeply nested routes through Outlet chain", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // All three levels should be rendered
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
      expect(screen.getByTestId("posts-layout")).toBeInTheDocument();
      expect(screen.getByTestId("post-page")).toBeInTheDocument();
      expect(screen.getByTestId("post-id").textContent).toBe("42");
    });
  });
});

// ---------------------------------------------------------------------------
// Not-found handling
// ---------------------------------------------------------------------------
describe("RouterProvider not-found", () => {
  it("should render defaultNotFoundComponent for unmatched routes", async () => {
    const rootRoute = createRootRoute({
      notFoundComponent: NotFoundPage,
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: HomePage,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/nonexistent"] }),
      defaultNotFoundComponent: NotFoundPage,
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
      expect(screen.getByText("404 - Not Found")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Context propagation
// ---------------------------------------------------------------------------
describe("RouterProvider context", () => {
  it("should provide router and state context to descendant components", async () => {
    const rootRoute = createRootRoute({ component: ContextHarness });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("has-router").textContent).toBe("true");
      expect(screen.getByTestId("state-pathname").textContent).toBe("/");
    });
  });
});

// ---------------------------------------------------------------------------
// Cleanup on unmount
// ---------------------------------------------------------------------------
describe("RouterProvider cleanup", () => {
  it("should unsubscribe from store and history on unmount", async () => {
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

    const storeSub = { unsubscribe: vi.fn() };
    const historyUnsub = vi.fn();
    const storeSubscribeSpy = vi
      .spyOn(router.__store, "subscribe")
      .mockReturnValue(storeSub as any);
    const historySubscribeSpy = vi
      .spyOn(router.history, "subscribe")
      .mockReturnValue(historyUnsub);

    const { unmount } = render(TestRouterProvider, { props: { router } });

    // Unmount should trigger cleanup
    unmount();

    expect(storeSub.unsubscribe).toHaveBeenCalled();
    expect(historyUnsub).toHaveBeenCalled();

    storeSubscribeSpy.mockRestore();
    historySubscribeSpy.mockRestore();
  });
});
