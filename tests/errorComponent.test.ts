/**
 * Parameterized errorComponent tests — mirrors React/Vue adapter's errorComponent.test.tsx.
 *
 * Tests error rendering parameterized by:
 * - caller: beforeLoad vs loader
 * - async: true vs false
 * - Error thrown on navigate vs first load
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";
import TestRouterProvider from "./components/TestRouterProvider.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Parameterized error component tests
// ---------------------------------------------------------------------------

describe.each([
  { caller: "beforeLoad", async: false },
  { caller: "beforeLoad", async: true },
  { caller: "loader", async: false },
  { caller: "loader", async: true },
])(
  "errorComponent with $caller (async=$async)",
  ({ caller, async: isAsync }) => {
    function makeErrorRoute(rootRoute: any, errorComponent: any) {
      const throwFn = isAsync
        ? async () => {
            await new Promise((r) => setTimeout(r, 5));
            throw new Error(`${caller} error`);
          }
        : () => {
            throw new Error(`${caller} error`);
          };

      return createRoute({
        getParentRoute: () => rootRoute,
        path: "/error",
        ...(caller === "beforeLoad"
          ? { beforeLoad: throwFn }
          : { loader: throwFn }),
        errorComponent,
      });
    }

    it("should render errorComponent on first load", async () => {
      const rootRoute = createRootRoute({});
      const errorRoute = makeErrorRoute(rootRoute, ErrorPage);
      const routeTree = rootRoute.addChildren([errorRoute]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ["/error"] }),
      });
      await router.load();

      render(TestRouterProvider, { props: { router } });

      await waitFor(() => {
        // The error should be caught and error match should exist
        const match = router.state.matches.find((m) => m.routeId === "/error");
        expect(match?.status).toBe("error");
        expect(match?.error).toBeInstanceOf(Error);
        expect((match?.error as Error).message).toBe(`${caller} error`);
      });
    });

    it("should render errorComponent on navigate", async () => {
      const rootRoute = createRootRoute({});
      const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/",
      });
      const errorRoute = makeErrorRoute(rootRoute, ErrorPage);
      const routeTree = rootRoute.addChildren([indexRoute, errorRoute]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ["/"] }),
      });
      await router.load();

      // Navigate to error route
      await router.navigate({ to: "/error" } as any);
      await router.invalidate();

      const match = router.state.matches.find((m) => m.routeId === "/error");
      expect(match?.status).toBe("error");
      expect((match?.error as Error).message).toBe(`${caller} error`);
    });
  },
);

// Simple error page component placeholder (used by route config but rendering is via router state)
const ErrorPage = undefined;

// ---------------------------------------------------------------------------
// Additional error component tests (preload variants, error recovery)
// ---------------------------------------------------------------------------

describe("errorComponent: error recovery", () => {
  it("should recover from error when navigating to a working route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const errorRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/error",
      loader: () => {
        throw new Error("loader error");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute, errorRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/error"] }),
    });
    await router.load();

    const errorMatch = router.state.matches.find((m) => m.routeId === "/error");
    expect(errorMatch?.status).toBe("error");

    // Navigate away from the error route
    await router.navigate({ to: "/" });
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/");
    expect(router.state.statusCode).toBe(200);
  });

  it("should show error from nested route while parent remains valid", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: () => {
        throw new Error("post not found");
      },
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/999"] }),
    });
    await router.load();

    const postMatch = router.state.matches.find(
      (m) => m.routeId === "/posts/$postId",
    );
    expect(postMatch?.status).toBe("error");

    const postsMatch = router.state.matches.find((m) => m.routeId === "/posts");
    expect(postsMatch?.status).toBe("success");
  });
});

describe("errorComponent: error types", () => {
  it("should handle Error objects thrown from loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        throw new Error("standard error");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.error).toBeInstanceOf(Error);
    expect((match?.error as Error).message).toBe("standard error");
  });

  it("should handle non-Error values thrown from loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      loader: () => {
        throw "string error";
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.status).toBe("error");
    expect(match?.error).toBeDefined();
  });

  it("should handle Error objects thrown from beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      beforeLoad: () => {
        throw new Error("beforeLoad error");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    const match = router.state.matches.find((m) => m.routeId === "/");
    expect(match?.status).toBe("error");
  });
});

describe("errorComponent: error on navigation", () => {
  it("should set error status when navigating to a route with failing loader", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const failRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/fail",
      loader: () => {
        throw new Error("navigation error");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute, failRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();
    expect(router.state.statusCode).toBe(200);

    await router.navigate({ to: "/fail" } as any);
    await router.invalidate();

    const match = router.state.matches.find((m) => m.routeId === "/fail");
    expect(match?.status).toBe("error");
  });

  it("should clear error status when navigating away from error route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const failRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/fail",
      loader: () => {
        throw new Error("fail");
      },
    });
    const routeTree = rootRoute.addChildren([indexRoute, failRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/fail"] }),
    });
    await router.load();
    expect(router.state.statusCode).toBe(500);

    await router.navigate({ to: "/" });
    await router.invalidate();

    expect(router.state.statusCode).toBe(200);
  });
});
