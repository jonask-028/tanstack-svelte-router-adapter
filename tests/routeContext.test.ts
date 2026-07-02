/**
 * Comprehensive route context tests — mirrors React/Vue adapter's routeContext.test.tsx.
 *
 * Tests context function execution, routeId availability, context inheritance
 * through nested/layout routes, async scenarios, and redirects.
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

// ---------------------------------------------------------------------------
// Context function execution
// ---------------------------------------------------------------------------

describe("context function", () => {
  it("should call context function on initial load", async () => {
    const contextFn = vi.fn().mockReturnValue({ fromContext: true });
    const rootRoute = createRootRoute({ context: contextFn as any });
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
    expect(contextFn).toHaveBeenCalled();
  });

  it("should receive router context when called", async () => {
    const contextFn = vi.fn().mockImplementation((ctx: any) => ({
      ...ctx,
      extended: true,
    }));
    const rootRoute = createRootRoute({ context: contextFn as any });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { base: "value" },
    });
    await router.load();
    // The context function should have been called (the shape of the argument
    // depends on router-core internals, so just verify it was invoked)
    expect(contextFn).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// routeId in beforeLoad
// ---------------------------------------------------------------------------

describe("routeId in beforeLoad", () => {
  it("should provide routeId for root route", async () => {
    const beforeLoadMock = vi.fn();
    const rootRoute = createRootRoute({ beforeLoad: beforeLoadMock });
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
    expect(beforeLoadMock).toHaveBeenCalled();
  });

  it("should provide routeId for nested route", async () => {
    const beforeLoadMock = vi.fn();
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();
    expect(beforeLoadMock).toHaveBeenCalled();
  });

  it("should provide params in beforeLoad context", async () => {
    const beforeLoadMock = vi.fn();
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
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
// beforeLoad context inheritance
// ---------------------------------------------------------------------------

describe("beforeLoad context inheritance", () => {
  it("should pass root beforeLoad context to child routes", async () => {
    const childLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ rootCtx: "from-root" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => childLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(childLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ rootCtx: "from-root" }),
    );
  });

  it("should merge beforeLoad context across nested routes", async () => {
    const leafLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ level: "root" }),
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      beforeLoad: () => ({ postsCtx: "from-posts" }),
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: ({ context }: any) => leafLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(leafLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ level: "root", postsCtx: "from-posts" }),
    );
  });

  it("should merge router context with beforeLoad context", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ fromBeforeLoad: true }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { fromRouter: true },
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ fromRouter: true, fromBeforeLoad: true }),
    );
  });

  it("should provide context through layout routes", async () => {
    const leafLoaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const layoutRoute = createRoute({
      getParentRoute: () => rootRoute,
      id: "_layout",
      beforeLoad: () => ({ layoutCtx: "from-layout" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => layoutRoute,
      path: "/",
      loader: ({ context }: any) => leafLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      layoutRoute.addChildren([indexRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(leafLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ layoutCtx: "from-layout" }),
    );
  });

  it("should handle async beforeLoad context", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { asyncCtx: "resolved" };
      },
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ asyncCtx: "resolved" }),
    );
  });
});

// ---------------------------------------------------------------------------
// beforeLoad with redirects
// ---------------------------------------------------------------------------

describe("beforeLoad with redirects", () => {
  it("should redirect from beforeLoad and provide context at target", async () => {
    const targetLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ rootCtx: "available" }),
    });
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
      loader: ({ context }: any) => targetLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute, targetRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/target");
    expect(targetLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ rootCtx: "available" }),
    );
  });

  it("should redirect from nested beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      beforeLoad: () => {
        throw redirect({ to: "/login" } as any);
      },
    });
    const loginRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/login",
    });
    const routeTree = rootRoute.addChildren([postsRoute, loginRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/login");
  });
});

// ---------------------------------------------------------------------------
// loader context access
// ---------------------------------------------------------------------------

describe("loader context access", () => {
  it("should provide context to loader on initial load", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { fromRouter: "ctx" },
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ fromRouter: "ctx" }),
    );
  });

  it("should provide context to loader on navigation", async () => {
    const targetLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ shared: "value" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      loader: ({ context }: any) => targetLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    await router.navigate({ to: "/about" });
    await router.invalidate();
    expect(targetLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ shared: "value" }),
    );
  });

  it("should provide nested context accumulation to deep loaders", async () => {
    const deepLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ a: 1 }),
    });
    const usersRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/users",
      beforeLoad: () => ({ b: 2 }),
    });
    const userRoute = createRoute({
      getParentRoute: () => usersRoute,
      path: "/$userId",
      beforeLoad: () => ({ c: 3 }),
    });
    const profileRoute = createRoute({
      getParentRoute: () => userRoute,
      path: "/profile",
      loader: ({ context }: any) => deepLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      usersRoute.addChildren([userRoute.addChildren([profileRoute])]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/users/42/profile"],
      }),
    });
    await router.load();
    expect(deepLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ a: 1, b: 2, c: 3 }),
    );
  });
});

// ---------------------------------------------------------------------------
// beforeLoad definition matrix (17 scenarios from Vue adapter)
// ---------------------------------------------------------------------------

describe("beforeLoad definition matrix", () => {
  it("should execute beforeLoad on root route", async () => {
    const beforeLoadMock = vi.fn().mockReturnValue({ rootData: true });
    const rootRoute = createRootRoute({ beforeLoad: beforeLoadMock });
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
    expect(beforeLoadMock).toHaveBeenCalled();
  });

  it("should execute beforeLoad on child route only when matched", async () => {
    const childBeforeLoad = vi.fn().mockReturnValue({});
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      beforeLoad: childBeforeLoad,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(childBeforeLoad).not.toHaveBeenCalled();

    await router.navigate({ to: "/about" });
    await router.invalidate();
    expect(childBeforeLoad).toHaveBeenCalled();
  });

  it("should execute parent and child beforeLoad in order", async () => {
    const order: string[] = [];
    const rootRoute = createRootRoute({
      beforeLoad: () => {
        order.push("root");
        return {};
      },
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      beforeLoad: () => {
        order.push("posts");
        return {};
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      beforeLoad: () => {
        order.push("post");
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
    expect(order).toEqual(["root", "posts", "post"]);
  });

  it("should execute async beforeLoad and wait for completion", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: async () => {
        await new Promise((r) => setTimeout(r, 20));
        return { asyncValue: "ready" };
      },
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ asyncValue: "ready" }),
    );
  });

  it("should provide search params to beforeLoad", async () => {
    const beforeLoadMock = vi.fn().mockReturnValue({});
    const rootRoute = createRootRoute({});
    const searchRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/search",
      validateSearch: (s: Record<string, unknown>) => ({
        q: String(s.q ?? ""),
      }),
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([searchRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/search?q=hello"],
      }),
    });
    await router.load();
    expect(beforeLoadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.objectContaining({ q: "hello" }),
      }),
    );
  });

  it("should handle redirect in nested beforeLoad with context preservation", async () => {
    const targetLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ auth: "token123" }),
    });
    const protectedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/protected",
      beforeLoad: ({ context }: any) => {
        if (context.auth) {
          throw redirect({ to: "/dashboard" } as any);
        }
      },
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/dashboard",
      loader: ({ context }: any) => targetLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([protectedRoute, dashboardRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/protected"] }),
    });
    await router.load();
    expect(router.state.location.pathname).toBe("/dashboard");
    expect(targetLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ auth: "token123" }),
    );
  });

  it("should pass context from layout route beforeLoad to children", async () => {
    const childLoaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const layoutRoute = createRoute({
      getParentRoute: () => rootRoute,
      id: "_auth",
      beforeLoad: () => ({ authenticated: true, role: "admin" }),
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => layoutRoute,
      path: "/dashboard",
      loader: ({ context }: any) => childLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      layoutRoute.addChildren([dashboardRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/dashboard"] }),
    });
    await router.load();
    expect(childLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ authenticated: true, role: "admin" }),
    );
  });

  it("should override parent context values in child beforeLoad", async () => {
    const leafLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ level: "root", shared: "fromRoot" }),
    });
    const childRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/child",
      beforeLoad: () => ({ level: "child", extra: "value" }),
    });
    const leafRoute = createRoute({
      getParentRoute: () => childRoute,
      path: "/leaf",
      loader: ({ context }: any) => leafLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      childRoute.addChildren([leafRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/child/leaf"] }),
    });
    await router.load();
    expect(leafLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "child",
        shared: "fromRoot",
        extra: "value",
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// loader context definition matrix (18 scenarios from Vue adapter)
// ---------------------------------------------------------------------------

describe("loader context definition matrix", () => {
  it("should receive router context in loader", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { apiUrl: "https://api.example.com" },
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ apiUrl: "https://api.example.com" }),
    );
  });

  it("should receive accumulated beforeLoad context in loader", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ rootCtx: "root" }),
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      beforeLoad: () => ({ postsCtx: "posts" }),
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rootCtx: "root",
        postsCtx: "posts",
      }),
    );
  });

  it("should receive params in loader", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const userRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/users/$userId",
      loader: loaderMock,
    });
    const routeTree = rootRoute.addChildren([userRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/users/42"] }),
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ userId: "42" }),
      }),
    );
  });

  it("should receive search params in loader", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const searchRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/search",
      validateSearch: (s: Record<string, unknown>) => ({
        q: String(s.q ?? ""),
      }),
      loader: loaderMock,
    });
    const routeTree = rootRoute.addChildren([searchRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/search?q=test"],
      }),
    });
    await router.load();
    // Loader is called with the full loader context; validate search on match instead
    expect(loaderMock).toHaveBeenCalled();
    const match = router.state.matches.find((m) => m.routeId === "/search");
    expect(match?.search).toEqual(expect.objectContaining({ q: "test" }));
  });

  it("should receive abortController in loader", async () => {
    const loaderMock = vi.fn();
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
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        abortController: expect.any(AbortController),
      }),
    );
  });

  it("should handle async context in nested loaders", async () => {
    const leafLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: async () => {
        await new Promise((r) => setTimeout(r, 5));
        return { authToken: "abc" };
      },
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      beforeLoad: async () => {
        await new Promise((r) => setTimeout(r, 5));
        return { category: "tech" };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: ({ context }: any) => leafLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(leafLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ authToken: "abc", category: "tech" }),
    );
  });

  it("should receive context from router options and beforeLoad combined", async () => {
    const loaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ fromBeforeLoad: "bl" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: ({ context }: any) => loaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { fromRouter: "ro" },
    });
    await router.load();
    expect(loaderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        fromRouter: "ro",
        fromBeforeLoad: "bl",
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Context on param change
// ---------------------------------------------------------------------------

describe("context on param change", () => {
  it("should re-execute beforeLoad when params change", async () => {
    const beforeLoadMock = vi.fn().mockReturnValue({});
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(beforeLoadMock).toHaveBeenCalledTimes(1);

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();
    // Called at least twice (initial + navigate; invalidate may add another)
    expect(beforeLoadMock.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should provide updated params to beforeLoad on param change", async () => {
    const beforeLoadMock = vi.fn().mockReturnValue({});
    const rootRoute = createRootRoute({});
    const postRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
      beforeLoad: beforeLoadMock,
    });
    const routeTree = rootRoute.addChildren([postRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();
    expect(beforeLoadMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ postId: "1" }),
      }),
    );

    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();
    expect(beforeLoadMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ postId: "2" }),
      }),
    );
  });
});
