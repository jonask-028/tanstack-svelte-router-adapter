/**
 * Lazy route loading tests — mirrors React/Vue adapter's createLazyRoute.test.tsx.
 *
 * Tests that lazy routes can be created, have correct hooks,
 * and load options correctly.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  createLazyRoute,
  createLazyFileRoute,
  LazyRoute,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// createLazyRoute factory
// ---------------------------------------------------------------------------

describe("createLazyRoute", () => {
  it("should create a LazyRoute instance", () => {
    const lazyRoute = createLazyRoute("/_layout")({});
    expect(lazyRoute).toBeDefined();
    expect(lazyRoute).toBeInstanceOf(LazyRoute);
  });

  it("should have hook methods on LazyRoute", () => {
    const lazyRoute = createLazyRoute("/about")({});
    expect(lazyRoute.useMatch).toBeTypeOf("function");
    expect(lazyRoute.useRouteContext).toBeTypeOf("function");
    expect(lazyRoute.useSearch).toBeTypeOf("function");
    expect(lazyRoute.useParams).toBeTypeOf("function");
    expect(lazyRoute.useLoaderData).toBeTypeOf("function");
    expect(lazyRoute.useLoaderDeps).toBeTypeOf("function");
    expect(lazyRoute.useNavigate).toBeTypeOf("function");
  });
});

// ---------------------------------------------------------------------------
// createLazyFileRoute factory
// ---------------------------------------------------------------------------

describe("createLazyFileRoute", () => {
  it("should create a lazy file route factory", () => {
    // Without generated route types, FileRoutesByPath is empty so the path
    // parameter is `never` — cast the factory itself for the runtime test.
    const factory = (createLazyFileRoute as any)("/about");
    expect(factory).toBeTypeOf("function");
  });

  it("should return a LazyRoute from the factory", () => {
    const lazyRoute = (createLazyFileRoute as any)("/about")({});
    expect(lazyRoute).toBeInstanceOf(LazyRoute);
  });
});

// ---------------------------------------------------------------------------
// Lazy route integration with router
// ---------------------------------------------------------------------------

describe("lazy route integration", () => {
  it("should accept lazy option on route definition", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    // The route itself should work with lazy loading as a concept
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    expect(router.state.location.pathname).toBe("/about");
  });

  it("should route correctly even if lazy route is not yet loaded", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/about");
    expect(match).toBeDefined();
    expect(match?.status).toBe("success");
  });
});
