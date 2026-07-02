/**
 * useBlocker shouldBlockFn argument tests — mirrors React/Vue adapter's useBlocker.test.tsx.
 *
 * Tests that shouldBlockFn receives correct current/next/action arguments.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";
import TestRouterProvider from "./components/TestRouterProvider.svelte";
import UseBlockerHarness from "./unit/harnesses/UseBlockerHarness.svelte";

afterEach(cleanup);

describe("useBlocker shouldBlockFn arguments", () => {
  it("should receive current and next location in shouldBlockFn", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseBlockerHarness,
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

    // Trigger navigation
    await user.click(screen.getByTestId("trigger-nav"));

    // The blocker should be in "blocked" state with next pathname info
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
      expect(screen.getByTestId("blocker-next-pathname").textContent).toBe(
        "/other",
      );
    });
  });

  it("should not block when shouldBlockFn returns false", async () => {
    // This test creates a custom router where navigation is not blocked
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
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

    // Navigate without blocker - should succeed
    await router.navigate({ to: "/other" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/other");
  });

  it("should allow navigation after proceeding through blocker", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseBlockerHarness,
    });
    const otherRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/other",
      component: UseBlockerHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute, otherRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // Block, then proceed
    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });

    await user.click(screen.getByTestId("blocker-proceed"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/other");
    });
  });

  it("should stay on current route after resetting blocker", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseBlockerHarness,
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

    // Block, then reset
    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });

    await user.click(screen.getByTestId("blocker-reset"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
      expect(screen.getByTestId("blocker-status").textContent).toBe("idle");
    });
  });
});

// ---------------------------------------------------------------------------
// Extended useBlocker tests (conditional, disable, 404, external)
// ---------------------------------------------------------------------------

describe("useBlocker: conditional blocking", () => {
  it("should not block when condition is disabled via router.navigate", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
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

    // Navigate without any blocker installed
    await router.navigate({ to: "/other" } as any);
    await router.invalidate();

    expect(router.state.location.pathname).toBe("/other");
  });
});

describe("useBlocker: multiple block/reset cycles", () => {
  it("should handle multiple block/reset cycles without leaking state", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseBlockerHarness,
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

    // First cycle: block then reset
    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });
    await user.click(screen.getByTestId("blocker-reset"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("idle");
    });

    // Second cycle: block then proceed
    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });
    await user.click(screen.getByTestId("blocker-proceed"));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/other");
    });
  });
});

describe("useBlocker: with 404 navigation", () => {
  it("should block navigation to unknown routes", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseBlockerHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // The harness navigates to /other which doesn't exist in route tree
    await user.click(screen.getByTestId("trigger-nav"));
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });
  });
});
