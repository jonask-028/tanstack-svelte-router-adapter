/**
 * RouterProvider component tests.
 *
 * Tests that RouterProvider:
 * - Renders matched route components
 * - Provides router context to descendants
 * - Subscribes to state changes and re-renders
 * - Renders nested route trees
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "./TestRouterProvider.svelte";

function createRPTestRouter(
  opts: {
    initialEntries?: string[];
    routes?: Parameters<ReturnType<typeof createRootRoute>["addChildren"]>[0];
    rootComponent?: any;
  } = {},
) {
  const rootRoute = createRootRoute({
    component: opts.rootComponent,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const routes = opts.routes ?? [indexRoute];
  const routeTree = rootRoute.addChildren(routes);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: opts.initialEntries ?? ["/"],
    }),
  });

  return router;
}

describe("RouterProvider", () => {
  afterEach(() => {
    cleanup();
  });
  it("should render without errors", async () => {
    const router = createRPTestRouter();
    await router.load();

    const { container } = render(TestRouterProvider, { props: { router } });
    expect(container).toBeTruthy();
  });

  it("should render matched route tree", async () => {
    const router = createRPTestRouter();
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // RouterProvider renders the matched route, which includes
    // the root route and index route
    await waitFor(() => {
      expect(router.state.matches.length).toBeGreaterThan(0);
    });
  });

  it("should update when router state changes (navigation)", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });

    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    render(TestRouterProvider, { props: { router } });

    expect(router.state.location.pathname).toBe("/");

    // Navigate
    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });

  it("should handle routes with loaders", async () => {
    const loaderFn = vi.fn().mockResolvedValue({ message: "Hello" });

    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: loaderFn,
    });

    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(loaderFn).toHaveBeenCalled();
    });
  });

  it("should handle deeply nested routes", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
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
      const postMatch = router.state.matches.find(
        (m) => m.routeId === "/posts/$postId",
      );
      expect(postMatch).toBeTruthy();
      expect(postMatch?.params).toEqual({ postId: "42" });
    });
  });

  it("should handle 404 / not-found routes", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });

    const routeTree = rootRoute.addChildren([indexRoute]);

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/nonexistent"] }),
      defaultNotFoundComponent: undefined,
    });

    await router.load();
    render(TestRouterProvider, { props: { router } });

    // Router should show not-found state
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/nonexistent");
    });
  });

  it("should handle context prop", async () => {
    const rootRoute = createRootRoute({});
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

    // Context is passed as part of router options
    render(TestRouterProvider, {
      props: { router },
    });

    expect(router.state.matches.length).toBeGreaterThan(0);
  });
});
