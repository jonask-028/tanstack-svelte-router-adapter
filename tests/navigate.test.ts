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
