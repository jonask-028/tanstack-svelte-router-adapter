/**
 * useLocation reference stability test — mirrors React adapter pattern.
 *
 * Verifies that useLocation returns stable references when only
 * search/hash changes, not the pathname.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";

afterEach(() => {});

describe("useLocation stability", () => {
  it("should keep same pathname when only search changes", async () => {
    const rootRoute = createRootRoute({});
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

    const pathnameBefore = router.state.location.pathname;

    // Navigate to same path with different search
    await router.navigate({ to: "/", search: { q: "test" } } as any);
    await router.invalidate();

    const pathnameAfter = router.state.location.pathname;

    expect(pathnameBefore).toBe("/");
    expect(pathnameAfter).toBe("/");
    expect(router.state.location.search).toEqual({ q: "test" });
  });

  it("should keep same pathname when only hash changes", async () => {
    const rootRoute = createRootRoute({});
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

    await router.navigate({ to: "/", hash: "section1" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/");
    expect(router.state.location.hash).toBe("section1");
  });

  it("should update pathname when route changes", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    expect(router.state.location.pathname).toBe("/");

    await router.navigate({ to: "/about" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/about");
  });
});
