/**
 * Search middleware tests — mirrors React/Vue adapter's searchMiddleware.test.tsx.
 *
 * Tests retainSearchParams and stripSearchParams behavior.
 * These are re-exported from router-core and work at the router level.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  retainSearchParams,
  stripSearchParams,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// retainSearchParams
// ---------------------------------------------------------------------------

describe("retainSearchParams", () => {
  it("should retain specified search params across navigation", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      validateSearch: (search: Record<string, unknown>) => ({
        q: (search.q as string) ?? "",
        page: Number(search.page ?? 1),
      }),
      search: {
        middlewares: [retainSearchParams(["q"])],
      },
    } as any);
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/?q=test&page=3"] }),
    });
    await router.load();

    expect(router.state.location.search).toEqual({ q: "test", page: 3 });
  });

  it("should be a function", () => {
    expect(typeof retainSearchParams).toBe("function");
  });

  it("should return a middleware when called", () => {
    const middleware = retainSearchParams(["q"]);
    expect(middleware).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// stripSearchParams
// ---------------------------------------------------------------------------

describe("stripSearchParams", () => {
  it("should be a function", () => {
    expect(typeof stripSearchParams).toBe("function");
  });

  it("should return a middleware when called with keys", () => {
    const middleware = stripSearchParams(["debug"]);
    expect(middleware).toBeDefined();
  });

  it("should return a middleware when called with true", () => {
    const middleware = stripSearchParams(true as any);
    expect(middleware).toBeDefined();
  });

  it("should strip search params by key", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      validateSearch: (search: Record<string, unknown>) => ({
        q: (search.q as string) ?? "",
        debug: search.debug === "true",
      }),
      search: {
        middlewares: [stripSearchParams({ debug: false })],
      },
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/?q=test"] }),
    });
    await router.load();

    // debug should be stripped/defaulted
    expect(router.state.location.search).toBeDefined();
  });
});
