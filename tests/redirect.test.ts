/**
 * Redirect tests — mirrors Vue adapter's redirect.test.tsx.
 *
 * Tests redirect behavior in both SPA and SSR scenarios, covering
 * beforeLoad, loader, and post-invalidate redirects.
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
// SPA redirects
// ---------------------------------------------------------------------------

describe("redirect: SPA", () => {
  it("should redirect from beforeLoad on initial load", async () => {
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

  it("should redirect from loader on initial load", async () => {
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

  it("should redirect on navigation from beforeLoad", async () => {
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

    expect(router.state.location.pathname).toBe("/login");
  });

  it("should redirect on navigation from loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const protectedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/protected",
      loader: () => {
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

    expect(router.state.location.pathname).toBe("/login");
  });

  it("should redirect after invalidate", async () => {
    let shouldRedirect = false;
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        if (shouldRedirect) {
          throw redirect({ to: "/redirected" } as any);
        }
        return { ok: true };
      },
    });
    const redirectedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/redirected",
    });
    const routeTree = rootRoute.addChildren([indexRoute, redirectedRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/");

    // Now enable redirect and invalidate
    shouldRedirect = true;
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/redirected");
  });

  it("should handle redirect with search params", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({
          to: "/target",
          search: { from: "redirect" },
        } as any);
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
    expect(router.state.location.search).toEqual({ from: "redirect" });
  });

  it("should handle redirect with status code", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({ to: "/target", statusCode: 301 } as any);
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

  it("should handle redirect chain (A -> B -> C)", async () => {
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

  it("should preserve parent context through redirect", async () => {
    const targetLoaderMock = vi.fn();
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ auth: "user123" }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({ to: "/dashboard" } as any);
      },
    });
    const dashboardRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/dashboard",
      loader: ({ context }: any) => targetLoaderMock(context),
    });
    const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/dashboard");
    expect(targetLoaderMock).toHaveBeenCalledWith(
      expect.objectContaining({ auth: "user123" }),
    );
  });
});

// ---------------------------------------------------------------------------
// SSR redirects
// ---------------------------------------------------------------------------

describe("redirect: SSR-like scenarios", () => {
  it("should redirect from beforeLoad on server-like initial load", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw redirect({ to: "/login" } as any);
      },
    });
    const loginRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/login",
    });
    const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();

    // In SSR, the redirect should still result in the target location
    expect(router.state.location.pathname).toBe("/login");
    // The redirect info should be accessible
    expect(router.state.redirect).toBeDefined();
  });

  it("should redirect from loader on server-like initial load", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        throw redirect({ to: "/home" } as any);
      },
    });
    const homeRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/home",
    });
    const routeTree = rootRoute.addChildren([indexRoute, homeRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    await router.load();
    expect(router.state.location.pathname).toBe("/home");
  });
});
