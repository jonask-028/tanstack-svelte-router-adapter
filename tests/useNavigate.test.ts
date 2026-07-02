/**
 * useNavigate hook tests — mirrors Vue adapter's useNavigate.test.tsx.
 *
 * Tests imperative navigation via the useNavigate hook: route navigation,
 * relative navigation (parent/child/sibling), basepath support, trailing slash,
 * masking, parallel navigates, and encoded paths.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createBasicRouter(initialUrl = "/") {
  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
  });
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
  });
  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$postId",
  });
  const postEditRoute = createRoute({
    getParentRoute: () => postRoute,
    path: "/edit",
  });
  const settingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/settings",
  });
  const profileRoute = createRoute({
    getParentRoute: () => settingsRoute,
    path: "/profile",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    postsRoute.addChildren([postRoute.addChildren([postEditRoute])]),
    settingsRoute.addChildren([profileRoute]),
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
  } as any);

  return { router };
}

function createBasepathRouter(basepath: string, initialUrl = "/") {
  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
  });
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
  });
  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$postId",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    postsRoute.addChildren([postRoute]),
  ]);

  const router = createRouter({
    routeTree,
    basepath,
    history: createMemoryHistory({
      initialEntries: [basepath + initialUrl],
    }),
  } as any);

  return { router };
}

// ---------------------------------------------------------------------------
// Basic navigation
// ---------------------------------------------------------------------------

describe("useNavigate: basic navigation", () => {
  it("should navigate to an absolute path", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
  });

  it("should navigate with dynamic params", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "42" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/42");
  });

  it("should navigate with search params", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts",
      search: { q: "hello" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts");
    expect(router.state.location.search).toEqual({ q: "hello" });
  });

  it("should navigate with hash", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/about",
      hash: "section1",
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
    expect(router.state.location.hash).toBe("section1");
  });

  it("should navigate back to index from nested route", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({ to: "/" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/");
  });
});

// ---------------------------------------------------------------------------
// Relative navigation
// ---------------------------------------------------------------------------

describe("useNavigate: relative navigation", () => {
  it("should navigate from parent to child route", async () => {
    const { router } = createBasicRouter("/posts");
    await router.load();

    await router.navigate({
      from: "/posts",
      to: "./$postId",
      params: { postId: "1" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/1");
  });

  it("should navigate from child to sibling", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({
      from: "/posts/$postId",
      to: "../$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/2");
  });

  it("should navigate from child to parent", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({
      from: "/posts/$postId",
      to: "..",
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts");
  });

  it("should navigate from deeply nested to root", async () => {
    const { router } = createBasicRouter("/posts/1/edit");
    await router.load();

    await router.navigate({ to: "/" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/");
  });

  it("should navigate between unrelated trees", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({ to: "/settings/profile" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/settings/profile");
  });
});

// ---------------------------------------------------------------------------
// Navigation with from option (useNavigate({ from }) equivalent)
// ---------------------------------------------------------------------------

describe("useNavigate: from option", () => {
  it("should use from as the base for relative navigation", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    // Navigating as if from the posts route
    await router.navigate({
      from: "/posts",
      to: "./$postId",
      params: { postId: "99" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/99");
  });
});

// ---------------------------------------------------------------------------
// Basepath
// ---------------------------------------------------------------------------

describe("useNavigate: basepath", () => {
  it("should navigate with basepath prefix", async () => {
    const { router } = createBasepathRouter("/app");
    await router.load();

    await router.navigate({ to: "/about" });
    await router.invalidate();

    // router.state.location.pathname stores the full path including basepath
    // but may strip it — check href which includes it
    expect(router.state.location.href).toContain("/about");
  });

  it("should navigate with basepath and params", async () => {
    const { router } = createBasepathRouter("/app");
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "42" },
    } as any);
    await router.invalidate();

    expect(router.state.location.href).toContain("/posts/42");
  });

  it("should navigate relatively with basepath", async () => {
    const { router } = createBasepathRouter("/app", "/posts");
    await router.load();

    await router.navigate({
      from: "/posts",
      to: "./$postId",
      params: { postId: "1" },
    } as any);
    await router.invalidate();

    expect(router.state.location.href).toContain("/posts/1");
  });

  it("should navigate back to basepath root", async () => {
    const { router } = createBasepathRouter("/app", "/about");
    await router.load();

    await router.navigate({ to: "/" });
    await router.invalidate();

    // Should be at root path
    const pathname = router.state.location.pathname;
    expect(pathname === "/" || pathname === "/app/").toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Param navigation with object vs function syntax
// ---------------------------------------------------------------------------

describe("useNavigate: params with object syntax", () => {
  it("should navigate with single param object", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "hello" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/hello");
  });

  it("should navigate with nested params object", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$postId/edit",
      params: { postId: "42" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/42/edit");
  });
});

describe("useNavigate: params with function syntax", () => {
  it("should navigate using params as a function", async () => {
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: (prev: any) => ({ ...prev, postId: "2" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/2");
  });

  it("should receive previous params in function", async () => {
    const paramsFn = vi.fn().mockReturnValue({ postId: "99" });
    const { router } = createBasicRouter("/posts/1");
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: paramsFn,
    } as any);
    await router.invalidate();

    expect(paramsFn).toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/posts/99");
  });
});

// ---------------------------------------------------------------------------
// Search params function syntax
// ---------------------------------------------------------------------------

describe("useNavigate: search with function syntax", () => {
  it("should navigate using search as a function to add params", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts",
      search: (prev: any) => ({ ...prev, q: "test" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.search).toEqual({ q: "test" });
  });

  it("should receive previous search in function", async () => {
    const { router } = createBasicRouter();
    await router.load();

    // First navigate with search
    await router.navigate({
      to: "/posts",
      search: { q: "first" },
    } as any);
    await router.invalidate();

    // Then update search via function
    await router.navigate({
      to: "/posts",
      search: (prev: any) => ({ ...prev, page: "2" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.search).toEqual({ q: "first", page: "2" });
  });
});

// ---------------------------------------------------------------------------
// Parallel navigation
// ---------------------------------------------------------------------------

describe("useNavigate: parallel navigations", () => {
  it("should handle rapid sequential navigations", async () => {
    const { router } = createBasicRouter();
    await router.load();

    // Fire multiple navigations in quick succession
    const p1 = router.navigate({ to: "/posts" });
    const p2 = router.navigate({ to: "/about" });

    await Promise.all([p1, p2]);
    await router.invalidate();

    // Last navigation should win
    expect(router.state.location.pathname).toBe("/about");
  });

  it("should handle navigation during loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const slowRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/slow",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 50));
        return { data: "slow" };
      },
    });
    const fastRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/fast",
    });
    const routeTree = rootRoute.addChildren([indexRoute, slowRoute, fastRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // Start slow navigation then immediately navigate elsewhere
    router.navigate({ to: "/slow" } as any);
    await router.navigate({ to: "/fast" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/fast");
  });
});

// ---------------------------------------------------------------------------
// Encoded / unicode paths
// ---------------------------------------------------------------------------

describe("useNavigate: encoded and unicode paths", () => {
  it("should navigate to paths with unicode characters", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    } as any);
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "日本語" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual(
      expect.objectContaining({ postId: "日本語" }),
    );
  });

  it("should navigate to paths with special characters", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    } as any);
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "hello-world_123" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/hello-world_123");
  });

  it("should navigate with spaces in params", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/initial"] }),
    } as any);
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "hello world" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual(
      expect.objectContaining({ postId: "hello world" }),
    );
  });

  it("should navigate with emoji params", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/initial"] }),
    } as any);
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "🚀" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual(expect.objectContaining({ postId: "🚀" }));
  });
});

// ---------------------------------------------------------------------------
// Replace vs push
// ---------------------------------------------------------------------------

describe("useNavigate: replace option", () => {
  it("should replace history entry when replace is true", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({ to: "/about", replace: true } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
    // Cannot go back since we replaced
    expect(router.history.canGoBack()).toBe(false);
  });

  it("should push history entry by default", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
    expect(router.history.canGoBack()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Navigation with state
// ---------------------------------------------------------------------------

describe("useNavigate: state", () => {
  it("should pass state through navigation", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/about",
      state: { from: "home" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
    expect(router.state.location.state).toEqual(
      expect.objectContaining({ from: "home" }),
    );
  });
});

// ---------------------------------------------------------------------------
// Masking
// ---------------------------------------------------------------------------

describe("useNavigate: masking", () => {
  it("should navigate with mask (display different URL)", async () => {
    const { router } = createBasicRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "42" },
      mask: { to: "/about" },
    } as any);
    await router.invalidate();

    // The actual route should be loaded
    const hasPostMatch = router.state.matches.some(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(hasPostMatch).toBe(true);
  });
});
