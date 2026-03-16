/**
 * Route & FileRoute tests — factory functions, getRouteApi, lazy routes.
 *
 * Mirrors vue-router/tests/fileRoute.test.ts and route.test.tsx.
 */
import { describe, expect, it } from "vitest";
import {
  createRoute,
  createRootRoute,
  createFileRoute,
  createLazyFileRoute,
  createLazyRoute,
  createRouter,
  getRouteApi,
} from "../src";
import {
  createRootRouteWithContext,
  rootRouteWithContext,
  NotFoundRoute,
  RouteApi,
} from "../src/route";

// ---------------------------------------------------------------------------
// getRouteApi
// ---------------------------------------------------------------------------

describe("getRouteApi", () => {
  it("should return an instance with the given id", () => {
    const api = getRouteApi("foo");
    expect(api.id).toBe("foo");
  });

  it("notFound should return a not-found error object", () => {
    const api = getRouteApi("foo");
    const result = api.notFound();
    expect(result).toBeDefined();
  });

  it("redirect should return a redirect object", () => {
    const api = getRouteApi("foo");
    const result = api.redirect({ to: "/bar" } as any);
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createFileRoute properties
// ---------------------------------------------------------------------------

describe("createFileRoute", () => {
  it("should return a factory function", () => {
    // @ts-expect-error - intentionally passing empty string for test
    const factory = createFileRoute("");
    expect(factory).toBeTypeOf("function");
  });

  it("should create a route with the given options", () => {
    // @ts-expect-error - intentionally passing empty string for test
    const route = createFileRoute("")({});
    expect(route).toBeDefined();
  });

  it("should have redirect method", () => {
    // @ts-expect-error - intentionally passing empty string for test
    const route = createFileRoute("")({});
    expect(route.redirect).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createLazyFileRoute properties
// ---------------------------------------------------------------------------

describe("createLazyFileRoute", () => {
  it("should return a factory function", () => {
    // @ts-expect-error - intentionally passing empty string for test
    const factory = createLazyFileRoute("");
    expect(factory).toBeTypeOf("function");
  });

  it("should create a route with the given options", () => {
    // @ts-expect-error - intentionally passing empty string for test
    const route = createLazyFileRoute("")({});
    expect(route).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createLazyRoute
// ---------------------------------------------------------------------------

describe("createLazyRoute", () => {
  it("should return a factory function", () => {
    const factory = createLazyRoute("test-id" as any);
    expect(factory).toBeTypeOf("function");
  });

  it("should return a LazyRoute instance with options", () => {
    const factory = createLazyRoute("test-id" as any);
    const route = factory({});
    expect(route).toBeInstanceOf(Object);
    expect(route.options).toBeDefined();
    expect(route.options.id).toBe("test-id");
  });

  it("should preserve the given id in options", () => {
    const factory = createLazyRoute("my-route-id" as any);
    const route = factory({});
    expect(route.options.id).toBe("my-route-id");
  });

  it.each(HOOK_NAMES)("should have %s", (hookName) => {
    const factory = createLazyRoute("test-id" as any);
    const route = factory({});
    expect(route[hookName]).toBeTypeOf("function");
  });
});

// ---------------------------------------------------------------------------
// Route property access
// ---------------------------------------------------------------------------

describe("Route properties after createRouter", () => {
  function setup() {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);

    return { rootRoute, indexRoute, postsRoute, routeTree };
  }

  it("to property is available after createRouter", () => {
    const { indexRoute, postsRoute, routeTree } = setup();
    createRouter({ routeTree });

    expect(indexRoute.to).toBe("/");
    expect(postsRoute.to).toBe("/posts");
  });

  it("fullPath property is available after createRouter", () => {
    const { indexRoute, postsRoute, routeTree } = setup();
    createRouter({ routeTree });

    expect(indexRoute.fullPath).toBe("/");
    expect(postsRoute.fullPath).toBe("/posts");
  });

  it("id property is available after createRouter", () => {
    const { indexRoute, postsRoute, routeTree } = setup();
    createRouter({ routeTree });

    expect(indexRoute.id).toBe("/");
    expect(postsRoute.id).toBe("/posts");
  });
});

// ---------------------------------------------------------------------------
// createRoute factory
// ---------------------------------------------------------------------------

describe("createRoute", () => {
  it("should create a route with the given options", () => {
    const rootRoute = createRootRoute({});
    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: "/test",
    });
    expect(route).toBeDefined();
  });

  it("should support validateSearch", () => {
    const rootRoute = createRootRoute({});
    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: "/search",
      validateSearch: (search: Record<string, unknown>) => ({
        q: (search.q as string) ?? "",
      }),
    });
    expect(route).toBeDefined();
  });

  it("validateSearch should process search params in a loaded router", async () => {
    const rootRoute = createRootRoute({});
    const searchRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/search",
      validateSearch: (search: Record<string, unknown>) => ({
        q: (search.q as string) ?? "default",
        page: Number(search.page ?? 1),
      }),
    });
    const routeTree = rootRoute.addChildren([searchRoute]);
    const { createMemoryHistory } = await import("@tanstack/history");
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/search?q=svelte&page=3"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m: any) => m.routeId === "/search",
    );
    expect(match).toBeDefined();
    expect((match as any).search).toEqual({ q: "svelte", page: 3 });
  });
});

// ---------------------------------------------------------------------------
// createRootRoute factory
// ---------------------------------------------------------------------------

describe("createRootRoute", () => {
  it("should create a root route", () => {
    const rootRoute = createRootRoute({});
    expect(rootRoute).toBeDefined();
  });

  it("should accept beforeLoad", () => {
    const rootRoute = createRootRoute({
      beforeLoad: () => ({ env: "test" }),
    });
    expect(rootRoute).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// createRootRouteWithContext
// ---------------------------------------------------------------------------

describe("createRootRouteWithContext", () => {
  it("should return a factory function", () => {
    const factory = createRootRouteWithContext<{ auth: string }>();
    expect(factory).toBeTypeOf("function");
  });

  it("should create a root route when called", () => {
    const factory = createRootRouteWithContext<{ auth: string }>();
    const rootRoute = factory({});
    expect(rootRoute).toBeDefined();
    expect(rootRoute.options).toBeDefined();
  });

  it("should accept route options like beforeLoad", () => {
    const factory = createRootRouteWithContext<{ auth: string }>();
    const rootRoute = factory({
      beforeLoad: () => ({ extra: "data" }),
    });
    expect(rootRoute).toBeDefined();
  });

  it("should work with createRouter", () => {
    const factory = createRootRouteWithContext<{ session: string }>();
    const rootRoute = factory({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      context: { session: "abc" },
    } as any);
    expect(router).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// rootRouteWithContext (deprecated alias)
// ---------------------------------------------------------------------------

describe("rootRouteWithContext (deprecated alias)", () => {
  it("should be the same function as createRootRouteWithContext", () => {
    expect(rootRouteWithContext).toBe(createRootRouteWithContext);
  });
});

// ---------------------------------------------------------------------------
// NotFoundRoute
// ---------------------------------------------------------------------------

describe("NotFoundRoute", () => {
  it("should create a route with id 404", () => {
    const rootRoute = createRootRoute({});
    const notFoundRoute = new NotFoundRoute({
      getParentRoute: () => rootRoute,
    });
    expect(notFoundRoute).toBeDefined();
    expect((notFoundRoute as any).options.id).toBe("404");
  });

  it.each(["useMatch", "useParams", "useSearch", "useNavigate"] as const)(
    "should have %s",
    (hookName) => {
      const rootRoute = createRootRoute({});
      const notFoundRoute = new NotFoundRoute({
        getParentRoute: () => rootRoute,
      });
      expect(notFoundRoute[hookName]).toBeTypeOf("function");
    },
  );
});

// ---------------------------------------------------------------------------
// RouteApi hook methods
// ---------------------------------------------------------------------------

describe("RouteApi", () => {
  it.each([...HOOK_NAMES, "notFound" as const, "redirect" as const])(
    "should have %s method",
    (methodName) => {
      const api = new RouteApi({ id: "/test" });
      expect(api[methodName]).toBeTypeOf("function");
    },
  );
});

// ---------------------------------------------------------------------------
// Route class hook methods
// ---------------------------------------------------------------------------

const HOOK_NAMES = [
  "useMatch",
  "useRouteContext",
  "useSearch",
  "useParams",
  "useLoaderDeps",
  "useLoaderData",
  "useNavigate",
] as const;

describe("Route hook methods", () => {
  it.each(HOOK_NAMES)("child route should have %s", (hookName) => {
    const rootRoute = createRootRoute({});
    const route = createRoute({
      getParentRoute: () => rootRoute,
      path: "/test",
    });
    expect(route[hookName]).toBeTypeOf("function");
  });

  it.each(HOOK_NAMES)("root route should have %s", (hookName) => {
    const rootRoute = createRootRoute({});
    expect(rootRoute[hookName]).toBeTypeOf("function");
  });
});

// ---------------------------------------------------------------------------
// LazyRoute hook methods
// ---------------------------------------------------------------------------

describe("LazyRoute hook methods", () => {
  it.each(HOOK_NAMES)("should have %s", (hookName) => {
    const factory = createLazyRoute("test-route" as any);
    const route = factory({});
    expect(route[hookName]).toBeTypeOf("function");
  });

  it("should store id in options", () => {
    const factory = createLazyRoute("my-route" as any);
    const route = factory({});
    expect(route.options.id).toBe("my-route");
  });
});
