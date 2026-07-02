/**
 * Navigate tests — detailed navigation & redirect scenarios.
 *
 * Mirrors vue-router/tests/navigate.test.tsx.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "../src";
import { createNavigateTestRouter } from "./utils";

afterEach(() => {
  vi.resetAllMocks();
});

describe("navigate", () => {
  it('should navigate from "/" to "/posts"', async () => {
    const { router } = createNavigateTestRouter();
    await router.load();
    expect(router.state.location.pathname).toBe("/");

    await router.navigate({ to: "/posts" });
    await router.invalidate();
    expect(router.state.location.pathname).toBe("/posts");
  });

  it("should navigate with dynamic params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "hello-world" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/hello-world");
  });

  it("should navigate with deeply nested params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/p/$projectId/$version/$framework",
      params: { projectId: "router", version: "v1", framework: "svelte" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/p/router/v1/svelte");
  });

  it("should change a single nested param", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({ initialEntries: ["/p/router/v1/react"] }),
    );
    await router.load();
    expect(router.state.location.pathname).toBe("/p/router/v1/react");

    await router.navigate({
      to: "/p/$projectId/$version/$framework",
      params: { projectId: "router", version: "v3", framework: "react" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/p/router/v3/react");
  });

  it("should navigate with search params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts",
      search: { q: "test" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts");
    expect(router.state.location.search).toEqual({ q: "test" });
  });
});

describe("redirect", () => {
  it("should redirect from beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({ to: "/target" } as any);
      },
    });
    const targetRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/target",
    });

    const routeTree = rootRoute.addChildren([indexRoute, targetRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/target");
  });

  it("should redirect from loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        throw redirect({ to: "/posts" });
      },
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });

    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/posts");
  });

  it("should handle redirect chains", async () => {
    const rootRoute = createRootRoute({});
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

    const routeTree = rootRoute.addChildren([aRoute, bRoute, cRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/a"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/c");
  });
});

// ---------------------------------------------------------------------------
// Navigate with optional path params (function syntax)
// ---------------------------------------------------------------------------

describe("navigate: optional path params with object syntax", () => {
  it("should navigate with single required param", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "my-post" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/my-post");
  });

  it("should navigate with multiple params as object", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/p/$projectId/$version/$framework",
      params: { projectId: "router", version: "v2", framework: "svelte" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/p/router/v2/svelte");
  });

  it("should navigate from param route to another param value", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({ initialEntries: ["/posts/old-post"] }),
    );
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "new-post" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/new-post");
  });
});

describe("navigate: optional path params with function syntax", () => {
  it("should navigate using params as a function", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({ initialEntries: ["/posts/old"] }),
    );
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: (prev: any) => ({ ...prev, slug: "updated" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/updated");
  });

  it("should receive previous params in function", async () => {
    const paramsFn = vi.fn().mockReturnValue({
      projectId: "new-project",
      version: "v3",
      framework: "svelte",
    });
    const { router } = createNavigateTestRouter(
      createMemoryHistory({
        initialEntries: ["/p/old-project/v1/react"],
      }),
    );
    await router.load();

    await router.navigate({
      to: "/p/$projectId/$version/$framework",
      params: paramsFn,
    } as any);
    await router.invalidate();

    expect(paramsFn).toHaveBeenCalled();
    expect(router.state.location.pathname).toBe("/p/new-project/v3/svelte");
  });

  it("should navigate with mixed existing and new params", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({
        initialEntries: ["/p/router/v1/react"],
      }),
    );
    await router.load();

    await router.navigate({
      to: "/p/$projectId/$version/$framework",
      params: (prev: any) => ({
        ...prev,
        version: "v2",
      }),
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/p/router/v2/react");
  });
});

// ---------------------------------------------------------------------------
// Navigate with search function syntax
// ---------------------------------------------------------------------------

describe("navigate: search params with function syntax", () => {
  it("should navigate using search as a function", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts",
      search: () => ({ q: "test" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.search).toEqual({ q: "test" });
  });

  it("should carry forward previous search params", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({ initialEntries: ["/posts?q=hello"] }),
    );
    await router.load();

    await router.navigate({
      to: "/posts",
      search: (prev: any) => ({ ...prev, page: "2" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.search).toEqual({ q: "hello", page: "2" });
  });

  it("should remove search params by omitting them", async () => {
    const { router } = createNavigateTestRouter(
      createMemoryHistory({ initialEntries: ["/posts?q=hello&page=2"] }),
    );
    await router.load();

    await router.navigate({
      to: "/posts",
      search: () => ({ page: "3" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.search).toEqual({ page: "3" });
    expect(router.state.location.search.q).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Navigate with splat routes
// ---------------------------------------------------------------------------

describe("navigate: splat routes", () => {
  it("should navigate to splat route with empty splat", async () => {
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
    } as any);
    await router.load();

    await router.navigate({ to: "/catch-all/path" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/catch-all/path");
  });
});

// ---------------------------------------------------------------------------
// Navigate with encoded/unicode paths
// ---------------------------------------------------------------------------

describe("navigate: encoded and unicode paths", () => {
  it("should navigate with CJK characters in params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "日本語テスト" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$slug",
    );
    expect(match?.params).toEqual(
      expect.objectContaining({ slug: "日本語テスト" }),
    );
  });

  it("should navigate with emoji in params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "🚀🌟" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$slug",
    );
    expect(match?.params).toEqual(expect.objectContaining({ slug: "🚀🌟" }));
  });

  it("should navigate with special characters in params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "hello-world_2024" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/hello-world_2024");
  });

  it("should navigate with spaces in params", async () => {
    const { router } = createNavigateTestRouter();
    await router.load();

    await router.navigate({
      to: "/posts/$slug",
      params: { slug: "hello world" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$slug",
    );
    expect(match?.params).toEqual(
      expect.objectContaining({ slug: "hello world" }),
    );
  });
});
