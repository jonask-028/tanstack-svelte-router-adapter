/**
 * Param type matching tests — inspired by React/Vue adapter's Matches.test.tsx.
 *
 * Tests route matching with different parameter patterns including
 * standard params, splat routes, nested params, and edge cases.
 */
import { afterEach, describe, expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";

afterEach(() => {});

// ---------------------------------------------------------------------------
// Standard param matching
// ---------------------------------------------------------------------------

describe("param type matching: standard params", () => {
  it("should match single param $id", async () => {
    const rootRoute = createRootRoute({});
    const userRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/users/$id",
    });
    const routeTree = rootRoute.addChildren([userRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/users/42"] }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/users/$id",
    );
    expect(match).toBeDefined();
    expect(match?.params).toEqual({ id: "42" });
  });

  it("should match multiple params", async () => {
    const rootRoute = createRootRoute({});
    const fileRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId/repo/$repoId",
    });
    const routeTree = rootRoute.addChildren([fileRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/repo/web"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/repo/$repoId",
    );
    expect(match?.params).toEqual({ orgId: "acme", repoId: "web" });
  });
});

// ---------------------------------------------------------------------------
// Splat / wildcard matching
// ---------------------------------------------------------------------------

describe("param type matching: splat routes", () => {
  it("should match splat route $", async () => {
    const rootRoute = createRootRoute({});
    const filesRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/files/$",
    });
    const routeTree = rootRoute.addChildren([filesRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/files/docs/readme.md"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/files/$",
    );
    expect(match).toBeDefined();
    expect(match?.params._splat).toBe("docs/readme.md");
  });

  it("should match top-level splat for unknown paths", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const splatRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "$",
    });
    const routeTree = rootRoute.addChildren([indexRoute, splatRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/anything/here"],
      }),
    });
    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/$");
    expect(match).toBeDefined();
  });

  it("should prefer specific routes over splat", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const splatRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "$",
    });
    const routeTree = rootRoute.addChildren([aboutRoute, splatRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    const routeIds = router.state.matches.map((m) => m.routeId);
    expect(routeIds).toContain("/about");
    expect(routeIds).not.toContain("/$");
  });
});

// ---------------------------------------------------------------------------
// Nested param matching
// ---------------------------------------------------------------------------

describe("param type matching: nested params", () => {
  it("should accumulate params through nesting", async () => {
    const rootRoute = createRootRoute({});
    const orgRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId",
    });
    const teamRoute = createRoute({
      getParentRoute: () => orgRoute,
      path: "/team/$teamId",
    });
    const routeTree = rootRoute.addChildren([
      orgRoute.addChildren([teamRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/team/eng"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/team/$teamId",
    );
    expect(match?.params).toEqual({ orgId: "acme", teamId: "eng" });
  });

  it("should have correct _strictParams at each nesting level", async () => {
    const rootRoute = createRootRoute({});
    const orgRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/org/$orgId",
    });
    const teamRoute = createRoute({
      getParentRoute: () => orgRoute,
      path: "/team/$teamId",
    });
    const routeTree = rootRoute.addChildren([
      orgRoute.addChildren([teamRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/org/acme/team/eng"],
      }),
    });
    await router.load();

    const orgMatch = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId",
    );
    const teamMatch = router.state.matches.find(
      (m) => m.routeId === "/org/$orgId/team/$teamId",
    );

    // _strictParams contains only the params introduced at that level
    expect(orgMatch?._strictParams).toBeDefined();
    expect(orgMatch?._strictParams.orgId).toBe("acme");
    expect(teamMatch?._strictParams).toBeDefined();
    expect(teamMatch?._strictParams.teamId).toBe("eng");
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("param type matching: edge cases", () => {
  it("should handle params with special characters", async () => {
    const rootRoute = createRootRoute({});
    const userRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/users/$id",
    });
    const routeTree = rootRoute.addChildren([userRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/users/user%40example.com"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/users/$id",
    );
    expect(match?.params.id).toBe("user@example.com");
  });

  it("should handle deeply nested params", async () => {
    const rootRoute = createRootRoute({});
    const aRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/a/$a",
    });
    const bRoute = createRoute({
      getParentRoute: () => aRoute,
      path: "/b/$b",
    });
    const cRoute = createRoute({
      getParentRoute: () => bRoute,
      path: "/c/$c",
    });
    const routeTree = rootRoute.addChildren([
      aRoute.addChildren([bRoute.addChildren([cRoute])]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({
        initialEntries: ["/a/1/b/2/c/3"],
      }),
    });
    await router.load();

    const match = router.state.matches.find(
      (m) => m.routeId === "/a/$a/b/$b/c/$c",
    );
    expect(match?.params).toEqual({ a: "1", b: "2", c: "3" });
  });

  it("should match index route when nested params route exists", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts/$postId",
    });
    const routeTree = rootRoute.addChildren([indexRoute, postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const routeIds = router.state.matches.map((m) => m.routeId);
    expect(routeIds).toContain("/");
  });
});
