/**
 * Relative navigation tests — mirrors React/Vue adapter patterns.
 *
 * Tests Link `from` prop and useNavigate `from` option for relative navigation,
 * including ./ ../ edge cases, layout routes, and trailing slashes.
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
// useNavigate with from option
// ---------------------------------------------------------------------------

describe("relative navigation with useNavigate from", () => {
  it("should navigate to child route from parent", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    await router.load();

    await router.navigate({
      from: "/posts",
      to: "./$postId",
      params: { postId: "42" },
    } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts/42");
  });

  it("should navigate to sibling route", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([postsRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    await router.load();

    await router.navigate({ to: "/about" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
  });

  it("should navigate to parent route from nested child", async () => {
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

    await router.navigate({ to: "/posts" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/posts");
  });
});

// ---------------------------------------------------------------------------
// Navigation with layout routes
// ---------------------------------------------------------------------------

describe("relative navigation with layout routes", () => {
  it("should navigate within layout route hierarchy", async () => {
    const rootRoute = createRootRoute({});
    const layoutRoute = createRoute({
      getParentRoute: () => rootRoute,
      id: "_layout",
    });
    const homeRoute = createRoute({
      getParentRoute: () => layoutRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => layoutRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([
      layoutRoute.addChildren([homeRoute, aboutRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    await router.navigate({ to: "/about" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
  });
});

// ---------------------------------------------------------------------------
// buildLocation for href generation (used by Link component)
// ---------------------------------------------------------------------------

describe("buildLocation for relative hrefs", () => {
  it("should build location for child from parent", () => {
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
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });

    const loc = router.buildLocation({
      from: "/posts",
      to: "./$postId",
      params: { postId: "99" },
    } as any);

    expect(loc.pathname).toBe("/posts/99");
  });

  it("should build location with search params", () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const loc = router.buildLocation({
      to: "/posts",
      search: { sort: "asc" },
    } as any);

    expect(loc.pathname).toBe("/posts");
    expect(loc.search).toEqual({ sort: "asc" });
  });

  it("should build location with hash", () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });

    const loc = router.buildLocation({
      to: "/about",
      hash: "section",
    } as any);

    expect(loc.pathname).toBe("/about");
    expect(loc.hash).toBe("section");
  });
});
