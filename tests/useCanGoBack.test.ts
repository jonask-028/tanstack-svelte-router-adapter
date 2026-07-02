/**
 * useCanGoBack hook tests — mirrors Vue adapter's useCanGoBack.test.tsx.
 *
 * Tests history stack awareness: false when no history behind,
 * true when there is.
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

describe("useCanGoBack", () => {
  it("should return false when there is no history behind", async () => {
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

    // No prior navigation — canGoBack should be false
    expect(router.history.canGoBack()).toBe(false);
  });

  it("should return true when there is history behind", async () => {
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

    await router.navigate({ to: "/about" });
    await router.invalidate();

    // After navigating, canGoBack should be true
    expect(router.history.canGoBack()).toBe(true);
  });

  it("should return false after going back to the start", async () => {
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

    await router.navigate({ to: "/about" });
    await router.invalidate();
    expect(router.history.canGoBack()).toBe(true);

    // Go back
    router.history.back();
    expect(router.history.canGoBack()).toBe(false);
  });

  it("should return true with multiple history entries", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const contactRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/contact",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      aboutRoute,
      contactRoute,
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    await router.navigate({ to: "/about" });
    await router.invalidate();
    await router.navigate({ to: "/contact" });
    await router.invalidate();

    expect(router.history.canGoBack()).toBe(true);
  });
});
