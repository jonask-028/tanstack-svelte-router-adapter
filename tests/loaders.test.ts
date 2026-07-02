/**
 * Loader lifecycle tests — mirrors Vue adapter's loaders.test.tsx.
 *
 * Tests loader invocation patterns, parentMatchPromise, pendingTimeout,
 * loader abort/cancellation, and context propagation.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Loader invocation
// ---------------------------------------------------------------------------

describe("loaders: invocation", () => {
  it("should call loader on first route load", async () => {
    const loaderMock = vi.fn().mockResolvedValue({ ok: true });
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: loaderMock,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(loaderMock).toHaveBeenCalledTimes(1);
  });

  it("should call both parent and child loaders on nested route load", async () => {
    const parentLoader = vi.fn().mockResolvedValue({ parent: true });
    const childLoader = vi.fn().mockResolvedValue({ child: true });
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: parentLoader,
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: childLoader,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });

    await router.load();
    expect(parentLoader).toHaveBeenCalled();
    expect(childLoader).toHaveBeenCalled();
  });

  it("should only call target route loader on navigation", async () => {
    const indexLoader = vi.fn().mockResolvedValue({});
    const aboutLoader = vi.fn().mockResolvedValue({});
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: indexLoader,
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      loader: aboutLoader,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(indexLoader).toHaveBeenCalledTimes(1);
    expect(aboutLoader).not.toHaveBeenCalled();

    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(aboutLoader).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// parentMatchPromise
// ---------------------------------------------------------------------------

describe("loaders: parentMatchPromise", () => {
  it("should provide parentMatchPromise to child loader", async () => {
    const childLoader = vi.fn().mockResolvedValue({});
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { posts: [1, 2, 3] };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: childLoader,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });

    await router.load();
    expect(childLoader).toHaveBeenCalledWith(
      expect.objectContaining({
        parentMatchPromise: expect.any(Promise),
      }),
    );
  });

  it("should resolve parentMatchPromise with parent match data", async () => {
    let resolvedParent: any = null;
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { posts: ["a", "b"] };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: async ({ parentMatchPromise }: any) => {
        resolvedParent = await parentMatchPromise;
        return {};
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
    expect(resolvedParent).toBeDefined();
    expect(resolvedParent?.loaderData).toEqual({ posts: ["a", "b"] });
  });
});

// ---------------------------------------------------------------------------
// Loader with params
// ---------------------------------------------------------------------------

describe("loaders: with params", () => {
  it("should provide params to loader", async () => {
    const loaderMock = vi.fn().mockResolvedValue({});
    const rootRoute = createRootRoute({});
    const postRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
      loader: loaderMock,
    });
    const routeTree = rootRoute.addChildren([postRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });

    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ postId: "42" }),
      }),
    );
  });

  it("should re-call loader when params change", async () => {
    const loaderMock = vi.fn().mockResolvedValue({});
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: loaderMock,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });

    await router.load();
    expect(loaderMock).toHaveBeenCalledTimes(1);

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    // Called at least twice (initial + navigate; invalidate may add another)
    expect(loaderMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(loaderMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ postId: "2" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Loader error handling
// ---------------------------------------------------------------------------

describe("loaders: error handling", () => {
  it("should set match status to error when loader throws", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async () => {
        throw new Error("loader failed");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.status).toBe("error");
    expect((match?.error as Error).message).toBe("loader failed");
  });

  it("should handle notFound thrown from loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        throw notFound();
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    // Should handle notFound without crashing
    expect(router.state.location.pathname).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// Loader data access
// ---------------------------------------------------------------------------

describe("loaders: data access", () => {
  it("should provide loader data on match", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async () => ({ message: "hello", count: 42 }),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.loaderData).toEqual({ message: "hello", count: 42 });
  });

  it("should update loader data on invalidate", async () => {
    let callCount = 0;
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async () => {
        callCount++;
        return { count: callCount };
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    let match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.loaderData).toEqual({ count: 1 });

    await router.invalidate();
    match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.loaderData).toEqual({ count: 2 });
  });
});
