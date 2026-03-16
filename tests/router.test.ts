/**
 * Router core tests — routing, matching, params, search, navigation.
 *
 * Mirrors the Vue adapter's router.test.tsx but adapted for Svelte's
 * non-JSX testing approach. Tests the router without rendering components.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  redirect,
} from "../src";
import type { AnyRoute, AnyRouter, RouterOptions } from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createTestRouter(
  options?: Partial<RouterOptions<AnyRoute, "never", any, any, any>>,
) {
  const rootRoute = createRootRoute({
    validateSearch: z.object({ root: z.string().optional() }),
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/users",
  });
  const userRoute = createRoute({
    getParentRoute: () => usersRoute,
    path: "/$userId",
  });
  const userFilesRoute = createRoute({
    getParentRoute: () => userRoute,
    path: "/files/$fileId",
  });
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
  });
  const postIdRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$slug",
  });
  const topLevelSplatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    usersRoute.addChildren([userRoute.addChildren([userFilesRoute])]),
    postsRoute.addChildren([postIdRoute]),
    topLevelSplatRoute,
  ]);

  const router = createRouter({
    routeTree,
    ...options,
  } as any);

  return {
    router,
    routes: {
      rootRoute,
      indexRoute,
      usersRoute,
      userRoute,
      userFilesRoute,
      postsRoute,
      postIdRoute,
      topLevelSplatRoute,
    },
  };
}

// ---------------------------------------------------------------------------
// URL encoding: param segments
// ---------------------------------------------------------------------------

describe("encoding: URL param segment for /posts/$slug", () => {
  it.each([
    { input: "/posts/tanner", expected: "/posts/tanner", label: "plain ASCII" },
    { input: "/posts/🚀", expected: "/posts/🚀", label: "unicode emoji" },
    {
      input: "/posts/100%25",
      expected: "/posts/100%25",
      label: "percent-encoded",
    },
    {
      input: "/posts/hello%20world",
      expected: "/posts/hello world",
      label: "space encoded",
    },
    { input: "/posts/a+b", expected: "/posts/a+b", label: "plus sign" },
  ])("should handle $label ($input)", async ({ input, expected }) => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: [input] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// Route matching
// ---------------------------------------------------------------------------

describe("route matching", () => {
  it("should match the index route", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(router.state.matches.map((m) => m.routeId)).toContain("/");
  });

  it("should match nested routes /users/$userId/files/$fileId", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({
        initialEntries: ["/users/5678/files/123"],
      }),
    });
    await router.load();
    expect(router.state.matches.map((m) => m.routeId)).toEqual([
      "__root__",
      "/users",
      "/users/$userId",
      "/users/$userId/files/$fileId",
    ]);
  });

  it("should fall through to splat route for unknown paths", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({
        initialEntries: ["/something-unknown"],
      }),
    });
    await router.load();
    expect(router.state.matches.map((m) => m.routeId)).toContain("/$");
  });
});

// ---------------------------------------------------------------------------
// Params
// ---------------------------------------------------------------------------

describe("params", () => {
  it("should parse nested params correctly", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({
        initialEntries: ["/users/5678/files/123"],
      }),
    });
    await router.load();

    const expectedStrictParams: Record<string, unknown> = {
      __root__: {},
      "/users": {},
      "/users/$userId": { userId: "5678" },
      "/users/$userId/files/$fileId": { userId: "5678", fileId: "123" },
    };

    router.state.matches.forEach((match) => {
      expect(match.params).toEqual(
        expectedStrictParams["/users/$userId/files/$fileId"],
      );
    });

    router.state.matches.forEach((match) => {
      expect(match._strictParams).toEqual(expectedStrictParams[match.routeId]);
    });
  });
});

// ---------------------------------------------------------------------------
// Search params
// ---------------------------------------------------------------------------

describe("search params", () => {
  it("should parse search params from the URL", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({
        initialEntries: ["/?root=hello"],
      }),
    });
    await router.load();
    expect(router.state.location.search).toEqual({ root: "hello" });
  });

  it("should have empty search when no params present", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    // root is optional, so should be absent or undefined
    expect(router.state.location.search.root).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

describe("navigation", () => {
  it("should navigate to a new route", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/");

    await router.navigate({ to: "/posts/hello" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/hello");
  });

  it("should navigate with params", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    await router.navigate({
      to: "/users/$userId/files/$fileId",
      params: { userId: "42", fileId: "99" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/users/42/files/99");
  });
});

// ---------------------------------------------------------------------------
// Router state
// ---------------------------------------------------------------------------

describe("router state", () => {
  it("should track status code (default 200)", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(router.state.statusCode).toBe(200);
  });

  it("should have the correct href and pathname", async () => {
    const { router } = createTestRouter({
      history: createMemoryHistory({ initialEntries: ["/posts/test"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/posts/test");
    expect(router.state.location.href).toBe("/posts/test");
  });
});

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

describe("loaders", () => {
  it("should call loader on route load", async () => {
    const loaderMock = vi.fn().mockResolvedValue({ data: "test" });

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
    expect(loaderMock).toHaveBeenCalled();
  });

  it("should call loader on navigation", async () => {
    const indexLoaderMock = vi.fn();
    const postsLoaderMock = vi.fn();

    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: indexLoaderMock,
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: postsLoaderMock,
    });

    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(indexLoaderMock).toHaveBeenCalled();
    expect(postsLoaderMock).not.toHaveBeenCalled();

    await router.navigate({ to: "/posts" });
    await router.invalidate();

    expect(postsLoaderMock).toHaveBeenCalled();
  });

  it("should provide loader data on matches", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async () => ({ message: "hello" }),
    });

    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.loaderData).toEqual({ message: "hello" });
  });
});

// ---------------------------------------------------------------------------
// Redirects
// ---------------------------------------------------------------------------

describe("redirects", () => {
  it("should handle redirect in beforeLoad", async () => {
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

  it("should handle redirect in loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
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
});

// ---------------------------------------------------------------------------
// Route context
// ---------------------------------------------------------------------------

describe("route context", () => {
  it("should provide router context to loaders", async () => {
    const contextMock = vi.fn();

    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async ({ context }: any) => {
        contextMock(context);
      },
    });

    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { foo: "bar" },
    });

    await router.load();
    expect(contextMock).toHaveBeenCalledWith(
      expect.objectContaining({ foo: "bar" }),
    );
  });

  it("should merge beforeLoad context with parent context", async () => {
    const loaderMock = vi.fn();

    const rootRoute = createRootRoute({
      beforeLoad: () => ({ rootValue: "fromRoot" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async ({ context }: any) => {
        loaderMock(context);
      },
    });

    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ rootValue: "fromRoot" }),
    );
  });
});

// ---------------------------------------------------------------------------
// createRouter factory
// ---------------------------------------------------------------------------

describe("createRouter", () => {
  it("should create a router instance", () => {
    const rootRoute = createRootRoute({});
    const router = createRouter({ routeTree: rootRoute });
    expect(router).toBeDefined();
    expect(router.state).toBeDefined();
    expect(router.navigate).toBeTypeOf("function");
  });

  it("should accept memory history", () => {
    const rootRoute = createRootRoute({});
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ["/test"] }),
    });
    expect(router).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// globalThis registration
// ---------------------------------------------------------------------------

describe("globalThis registration", () => {
  it("should register createFileRoute on globalThis", () => {
    // Router module is imported above, which triggers the globalThis assignment
    expect((globalThis as any).createFileRoute).toBeTypeOf("function");
  });

  it("should register createLazyFileRoute on globalThis", () => {
    expect((globalThis as any).createLazyFileRoute).toBeTypeOf("function");
  });

  it("globalThis.createFileRoute should create routes", () => {
    const factory = (globalThis as any).createFileRoute("");
    expect(factory).toBeTypeOf("function");
    const route = factory({});
    expect(route).toBeDefined();
  });
});
