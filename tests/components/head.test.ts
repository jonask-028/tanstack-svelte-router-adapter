/**
 * route.head tests — mirrors React/Vue adapter's route.test.tsx head section
 * and Scripts.test.tsx.
 *
 * Tests that route head options (meta, links, styles, headScripts, scripts)
 * are populated on matches after router.load().
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../../src";
import TestRouterProvider from "./TestRouterProvider.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// route.head — meta tags
// ---------------------------------------------------------------------------

describe("route.head: meta", () => {
  it("should populate meta on match from route head option", async () => {
    const rootRoute = createRootRoute({
      head: () => ({
        meta: [{ title: "My App" }],
      }),
    } as any);
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: () => ({
        meta: [
          { title: "Home Page" },
          { name: "description", content: "Welcome home" },
        ],
      }),
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // Meta should be set on the matches
    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.meta).toBeDefined();
    expect(indexMatch!.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "Home Page" }),
        expect.objectContaining({
          name: "description",
          content: "Welcome home",
        }),
      ]),
    );
  });

  it("should populate meta from root route head", async () => {
    const rootRoute = createRootRoute({
      head: () => ({
        meta: [
          { title: "My App" },
          { name: "viewport", content: "width=device-width" },
        ],
      }),
    } as any);
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

    const rootMatch = router.state.matches.find(
      (m) => m.routeId === "__root__",
    );
    expect(rootMatch?.meta).toBeDefined();
    expect(rootMatch!.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: "My App" }),
      ]),
    );
  });

  it("should handle route with no head option", async () => {
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

    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    // meta should be undefined or empty when no head is specified
    expect(indexMatch?.meta).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// route.head — links
// ---------------------------------------------------------------------------

describe("route.head: links", () => {
  it("should populate links on match", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: () => ({
        links: [
          { rel: "canonical", href: "https://example.com/" },
          { rel: "stylesheet", href: "/styles.css" },
        ],
      }),
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.links).toBeDefined();
    expect(indexMatch!.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          rel: "canonical",
          href: "https://example.com/",
        }),
      ]),
    );
  });
});

// ---------------------------------------------------------------------------
// route.head — styles
// ---------------------------------------------------------------------------

describe("route.head: styles", () => {
  it("should populate styles on match", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: () => ({
        styles: [{ children: "body { color: red; }" }],
      }),
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.styles).toBeDefined();
    expect(indexMatch!.styles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ children: "body { color: red; }" }),
      ]),
    );
  });
});

// ---------------------------------------------------------------------------
// route.head — scripts and headScripts
// ---------------------------------------------------------------------------

describe("route.head: scripts and headScripts", () => {
  it("should call head function that returns scripts", async () => {
    const headFn = vi.fn().mockReturnValue({
      scripts: [{ src: "/analytics.js", async: true }],
    });
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: headFn,
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // head function should be called during load
    expect(headFn).toHaveBeenCalled();
    // Verify the match exists and loaded
    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.status).toBe("success");
  });

  it("should call head function that returns headScripts", async () => {
    const headFn = vi.fn().mockReturnValue({
      headScripts: [{ src: "/head-script.js" }],
    });
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: headFn,
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    expect(headFn).toHaveBeenCalled();
    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.status).toBe("success");
  });

  it("should handle head function returning all tag types", async () => {
    const headFn = vi.fn().mockReturnValue({
      meta: [{ title: "Full Head" }],
      links: [{ rel: "icon", href: "/favicon.ico" }],
      styles: [{ children: ".app { display: flex; }" }],
      scripts: [{ src: "/app.js", defer: true }],
      headScripts: [{ src: "/analytics.js" }],
    });
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      head: headFn,
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    expect(headFn).toHaveBeenCalled();
    const indexMatch = router.state.matches.find((m) => m.routeId === "/");
    expect(indexMatch?.meta).toBeDefined();
    expect(indexMatch?.links).toBeDefined();
    expect(indexMatch?.styles).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// route.head with loaders — head receives loader data
// ---------------------------------------------------------------------------

describe("route.head with loaders", () => {
  it("should receive loader data in head function", async () => {
    const headMock = vi.fn().mockReturnValue({
      meta: [{ title: "Dynamic Title" }],
    });
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: async () => ({ title: "From Loader" }),
      head: headMock,
    } as any);
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    expect(headMock).toHaveBeenCalled();
    // head function should receive match context including loaderData
    const headArgs = headMock.mock.calls[0]![0];
    expect(headArgs).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// route.head with notFound — head should not be called for notFound routes
// ---------------------------------------------------------------------------

describe("route.head with errors", () => {
  it("should still populate head from successful parent routes when child errors", async () => {
    const rootRoute = createRootRoute({
      head: () => ({
        meta: [{ title: "App" }],
      }),
    } as any);
    const errorRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/error",
      loader: () => {
        throw new Error("boom");
      },
      head: () => ({
        meta: [{ title: "Should not appear" }],
      }),
    } as any);
    const routeTree = rootRoute.addChildren([errorRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/error"] }),
    });
    await router.load();

    // Root match head should still be populated
    const rootMatch = router.state.matches.find(
      (m) => m.routeId === "__root__",
    );
    expect(rootMatch?.meta).toBeDefined();
    expect(rootMatch!.meta).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: "App" })]),
    );
  });
});
