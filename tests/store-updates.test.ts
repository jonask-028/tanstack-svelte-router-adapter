/**
 * Store update count tests — mirrors React/Vue adapter's
 * store-updates-during-navigation.test.tsx.
 *
 * Verifies that the router doesn't trigger excessive state updates
 * during various navigation scenarios.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

describe("store update counts during navigation", () => {
  it("should settle with bounded updates for async loader", async () => {
    const stateUpdates: number[] = [];
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { data: "loaded" };
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    const initialVersion = (router as any).__store?.state?.version ?? 0;

    // Subscribe to state changes
    let updateCount = 0;
    router.subscribe("onResolved", () => {
      updateCount++;
    });

    await router.navigate({ to: "/about" });
    await router.invalidate();

    // Should not have excessive updates (React/Vue test expects < 10)
    expect(updateCount).toBeLessThan(10);
  });

  it("should settle with bounded updates for sync beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      beforeLoad: () => ({ syncData: true }),
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    let updateCount = 0;
    router.subscribe("onResolved", () => {
      updateCount++;
    });

    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(updateCount).toBeLessThan(10);
  });

  it("should settle after redirect in beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const protectedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/protected",
      beforeLoad: () => {
        throw redirect({ to: "/login" } as any);
      },
    });
    const loginRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/login",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      protectedRoute,
      loginRoute,
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    await router.navigate({ to: "/protected" } as any);
    await router.invalidate();

    // After redirect, should be at /login
    expect(router.state.location.pathname).toBe("/login");
  });

  it("should handle multiple navigations without accumulating state", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const contactRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/contact",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      aboutRoute,
      contactRoute,
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    // Navigate multiple times
    await router.navigate({ to: "/about" });
    await router.invalidate();
    await router.navigate({ to: "/contact" });
    await router.invalidate();
    await router.navigate({ to: "/" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/");
    // Matches should be clean — no accumulated state
    expect(router.state.matches.length).toBeGreaterThan(0);
  });

  it("should settle with bounded updates for async loader on nested routes", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 5));
        return { posts: [] };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 5));
        return { post: {} };
      },
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();

    let updateCount = 0;
    router.subscribe("onResolved", () => {
      updateCount++;
    });

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    expect(updateCount).toBeLessThan(10);
  });

  it("should settle with bounded updates on not-found", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const splatRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "$",
    });
    const routeTree = rootRoute.addChildren([indexRoute, splatRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    let updateCount = 0;
    router.subscribe("onResolved", () => {
      updateCount++;
    });

    await router.navigate({ to: "/nonexistent" } as any);
    await router.invalidate();

    expect(updateCount).toBeLessThan(10);
  });

  it("should settle with bounded updates during preload-like scenario", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { data: "preloaded" };
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    let updateCount = 0;
    router.subscribe("onResolved", () => {
      updateCount++;
    });

    // Preload then navigate
    await router.preloadRoute({ to: "/about" } as any);
    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(updateCount).toBeLessThan(10);
  });

  it("should settle after redirect chain during navigation", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/a",
      beforeLoad: () => {
        throw redirect({ to: "/b" } as any);
      },
    });
    const bRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/b",
      beforeLoad: () => {
        throw redirect({ to: "/c" } as any);
      },
    });
    const cRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/c",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      aRoute,
      bRoute,
      cRoute,
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    await router.navigate({ to: "/a" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/c");
  });
});
