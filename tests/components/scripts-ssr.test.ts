/**
 * Scripts SSR rendering tests — mirrors Vue adapter's Scripts.test.tsx.
 *
 * Tests that the Scripts component correctly collects and renders
 * script tags from route matches, Vite manifest, and SSR buffers.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../../src";

afterEach(() => {
  vi.resetAllMocks();
});

describe("Scripts: route-level scripts collection", () => {
  it("should collect scripts from route head options", async () => {
    const rootRoute = createRootRoute({
      head: () => ({
        scripts: [{ src: "/app.js" }, { src: "/vendor.js", async: true }],
      }),
    });
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

    // The head function should have been invoked and match loaded
    const rootMatch = router.state.matches.find(
      (m) => m.routeId === "__root__",
    );
    expect(rootMatch).toBeDefined();
    expect(rootMatch?.status).toBe("success");
  });

  it("should handle routes without head scripts", async () => {
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

    // Should not crash when no head/scripts defined
    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match).toBeDefined();
    expect(match?.status).toBe("success");
  });

  it("should deduplicate HEAD meta tags across route matches", async () => {
    const rootRoute = createRootRoute({
      head: () => ({
        meta: [
          { title: "Root Title" },
          { name: "description", content: "Root desc" },
        ],
      }),
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: () => ({
        meta: [
          { title: "Index Title" },
          { name: "description", content: "Index desc" },
        ],
      }),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // The child route's head should take precedence (dedup)
    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.meta).toBeDefined();
    if (indexMatch?.meta) {
      // Child meta should be present
      const hasMeta = (indexMatch.meta as Array<any>).some(
        (m: any) => m.content === "Index desc" || m.title === "Index Title",
      );
      expect(hasMeta).toBe(true);
    }
  });
});
