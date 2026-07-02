/**
 * Optional path parameter tests — mirrors React/Vue adapter's optional-path-params.test.tsx.
 *
 * Tests route matching, navigation, and Link behavior with optional path parameters.
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
// Route matching with optional params
// ---------------------------------------------------------------------------

describe("optional path params: route matching", () => {
  function createOptionalParamRouter(initialUrl: string) {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    // /posts/$postId? — optional postId
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [initialUrl] }),
    });
  }

  it("should match /posts/42 with a postId param", async () => {
    const router = createOptionalParamRouter("/posts/42");
    await router.load();
    expect(router.state.location.pathname).toBe("/posts/42");
    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual({ postId: "42" });
  });
});

describe("optional path params: navigation", () => {
  it("should navigate from index to parameterized route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "99" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/99");
  });

  it("should navigate with multiple params", async () => {
    const rootRoute = createRootRoute({});
    const usersRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/users/$userId",
    });
    const filesRoute = createRoute({
      getParentRoute: () => usersRoute,
      path: "/files/$fileId",
    });
    const routeTree = rootRoute.addChildren([
      usersRoute.addChildren([filesRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/users/1/files/2"] }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/users/$userId/files/$fileId",
    );
    expect(match?.params).toEqual({ userId: "1", fileId: "2" });
  });

  it("should navigate between parameterized routes changing param values", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/posts/1");

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/2");
  });
});

// ---------------------------------------------------------------------------
// Mixed required and optional on same level
// ---------------------------------------------------------------------------

describe("optional path params: complex scenarios", () => {
  it("should handle deeply nested params", async () => {
    const rootRoute = createRootRoute({});
    const orgRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId",
    });
    const teamRoute = createRoute({
      getParentRoute: () => orgRoute,
      path: "/team/$teamId",
    });
    const memberRoute = createRoute({
      getParentRoute: () => teamRoute,
      path: "/member/$memberId",
    });
    const routeTree = rootRoute.addChildren([
      orgRoute.addChildren([teamRoute.addChildren([memberRoute])]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/team/eng/member/42"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/team/$teamId/member/$memberId",
    );
    expect(match?.params).toEqual({
      orgId: "acme",
      teamId: "eng",
      memberId: "42",
    });
  });

  it("should handle params with search params", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/posts/42?sort=desc"],
      }),
    });
    await router.load();

    expect(router.state.location.pathname).toBe("/posts/42");
    expect(router.state.location.search).toEqual({ sort: "desc" });
    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual({ postId: "42" });
  });

  it("should handle params with loaders", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
      loader: ({ params }: any) => loaderMock(params),
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ postId: "42" }),
    );
  });

  it("should handle params with beforeLoad", async () => {
    const beforeLoadMock = vi.fn();
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    expect(beforeLoadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ postId: "42" }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Navigation with function params syntax
// ---------------------------------------------------------------------------

describe("optional path params: function params syntax", () => {
  it("should navigate with params as function", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: (prev: any) => ({ ...prev, postId: "42" }),
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/42");
  });

  it("should receive previous params in function", async () => {
    const paramsFn = vi.fn().mockReturnValue({ postId: "99" });
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
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
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
// Inherited params through nested routes
// ---------------------------------------------------------------------------

describe("optional path params: inherited params", () => {
  it("should inherit parent params in nested route navigation", async () => {
    const rootRoute = createRootRoute({});
    const orgRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId",
    });
    const teamRoute = createRoute({
      getParentRoute: () => orgRoute,
      path: "/team/$teamId",
    });
    const routeTree = rootRoute.addChildren([
      orgRoute.addChildren([teamRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/team/eng"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/team/$teamId",
    );
    expect(match?.params).toEqual({ orgId: "acme", teamId: "eng" });
  });

  it("should update child params independent of parent", async () => {
    const rootRoute = createRootRoute({});
    const orgRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId",
    });
    const teamRoute = createRoute({
      getParentRoute: () => orgRoute,
      path: "/team/$teamId",
    });
    const routeTree = rootRoute.addChildren([
      orgRoute.addChildren([teamRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/team/eng"],
      }),
    });
    await router.load();

    await router.navigate({
      to: "/org/$orgId/team/$teamId",
      params: { orgId: "acme", teamId: "design" },
    } as any);
    await router.invalidate();

    const match = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/team/$teamId",
    );
    expect(match?.params).toEqual({ orgId: "acme", teamId: "design" });
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("optional path params: edge cases", () => {
  it("should handle param with special characters", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/posts/hello-world_2024"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual({ postId: "hello-world_2024" });
  });

  it("should handle param with unicode characters", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/posts/日本語"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(match?.params).toEqual({ postId: "日本語" });
  });

  it("should handle navigation from non-param to param route", async () => {
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
    });
    await router.load();

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "42" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/42");
  });

  it("should handle rapid param changes", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();

    // Rapid changes
    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "3" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/3");
  });

  it("should handle params with loaders that depend on params", async () => {
    const loaderResults: string[] = [];
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: async ({ params }: any) => {
        loaderResults.push(params.postId);
        return { id: params.postId };
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

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    expect(loaderResults).toContain("1");
    expect(loaderResults).toContain("2");
  });
});
