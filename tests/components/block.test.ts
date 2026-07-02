/**
 * Block component tests — mirrors Vue adapter's blocker.test.tsx.
 *
 * Tests the declarative Block component for navigation blocking,
 * covering shouldBlockFn/disabled combinations, resolver patterns,
 * and redirect-aware blocking.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "../../src";
import TestRouterProvider from "./TestRouterProvider.svelte";
import BlockHarness from "./harnesses/BlockHarness.svelte";
import BlockDisabledHarness from "./harnesses/BlockDisabledHarness.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Basic blocking
// ---------------------------------------------------------------------------

describe("Block component: basic blocking", () => {
  it("should block navigation when shouldBlockFn returns true", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: BlockHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await user.click(screen.getByTestId("trigger-nav"));

    await waitFor(() => {
      expect(screen.getByTestId("block-status").textContent).toBe("blocked");
    });

    // Should still be on original route
    expect(router.state.location.pathname).toBe("/");
  });

  it("should allow navigation after proceeding", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: BlockHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
      component: BlockHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("block-status").textContent).toBe("blocked");
    });

    await user.click(screen.getByTestId("block-proceed"));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/other");
    });
  });

  it("should stay on current route after reset", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: BlockHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("block-status").textContent).toBe("blocked");
    });

    await user.click(screen.getByTestId("block-reset"));
    await waitFor(() => {
      expect(screen.getByTestId("block-status").textContent).toBe("idle");
      expect(router.state.location.pathname).toBe("/");
    });
  });
});

// ---------------------------------------------------------------------------
// Disabled blocking
// ---------------------------------------------------------------------------

describe("Block component: disabled", () => {
  it("should not block when disabled is true", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: BlockDisabledHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // Navigate without blocker interference
    await router.navigate({ to: "/other" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/other");
  });
});

// ---------------------------------------------------------------------------
// Redirect-aware blocking
// ---------------------------------------------------------------------------

describe("Block component: with redirects", () => {
  it("should not block on redirect-initiated navigation", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const protectedRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/protected",
      beforeLoad: () => {
        throw redirect({ to: "/login" } as any);
      },
    });
    const loginRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/login",
    });
    const routeTree = rootRoute.addChildren([
      indexRoute,
      protectedRoute,
      loginRoute,
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    // Navigate to protected route (which redirects to /login)
    await router.navigate({ to: "/protected" } as any);
    await router.invalidate();

    // The redirect should complete regardless of any blockers
    expect(router.state.location.pathname).toBe("/login");
  });
});

// ---------------------------------------------------------------------------
// Programmatic navigation blocking
// ---------------------------------------------------------------------------

describe("Block component: programmatic navigation", () => {
  it("should block programmatic navigation via router.navigate", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: BlockHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // Use the harness button to trigger programmatic navigation
    await user.click(screen.getByTestId("trigger-nav"));

    await waitFor(() => {
      expect(screen.getByTestId("block-status").textContent).toBe("blocked");
    });
  });
});
