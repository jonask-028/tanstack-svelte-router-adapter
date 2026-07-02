/**
 * Unit tests — Context utilities (getRouterContext, getMatchContext, getRouterStateContext).
 *
 * Tests that the Svelte context setup and retrieval works
 * when components are rendered inside a RouterProvider tree,
 * and fails gracefully outside of one.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "../components/TestRouterProvider.svelte";
import UseRouterHarness from "./harnesses/UseRouterHarness.svelte";
import ContextHarness from "./harnesses/ContextHarness.svelte";

afterEach(cleanup);

describe("context utilities", () => {
  describe("getRouterContext", () => {
    it("should return the router instance inside RouterProvider", async () => {
      const rootRoute = createRootRoute({ component: ContextHarness });
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

      render(TestRouterProvider, { props: { router } });

      await waitFor(() => {
        expect(screen.getByTestId("has-router").textContent).toBe("true");
      });
    });
  });

  describe("getRouterStateContext", () => {
    it("should return reactive state with correct pathname", async () => {
      const rootRoute = createRootRoute({ component: ContextHarness });
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

      render(TestRouterProvider, { props: { router } });

      await waitFor(() => {
        expect(screen.getByTestId("state-pathname").textContent).toBe("/");
      });
    });

    it("should return state for /about pathname", async () => {
      const rootRoute = createRootRoute({ component: ContextHarness });
      const aboutRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: "/about",
      });
      const routeTree = rootRoute.addChildren([aboutRoute]);
      const router = createRouter({
        routeTree,
        history: createMemoryHistory({ initialEntries: ["/about"] }),
      });
      await router.load();

      render(TestRouterProvider, { props: { router } });

      await waitFor(() => {
        expect(screen.getByTestId("state-pathname").textContent).toBe("/about");
      });
    });
  });

  describe("getMatchContext", () => {
    it("should return current match ID inside route component", async () => {
      const rootRoute = createRootRoute({ component: ContextHarness });
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

      render(TestRouterProvider, { props: { router } });

      await waitFor(() => {
        // ContextHarness is the root route component, so match ID = root match
        const matchId = screen.getByTestId("match-id").textContent;
        expect(matchId).not.toBe("none");
      });
    });
  });

  describe("context key values", () => {
    it("ROUTER_CONTEXT_KEY should be a string", async () => {
      const { ROUTER_CONTEXT_KEY } = await import("../../src/context/keys.js");
      expect(typeof ROUTER_CONTEXT_KEY).toBe("string");
      expect(ROUTER_CONTEXT_KEY.length).toBeGreaterThan(0);
    });

    it("ROUTER_STATE_KEY should be a string", async () => {
      const { ROUTER_STATE_KEY } = await import("../../src/context/keys.js");
      expect(typeof ROUTER_STATE_KEY).toBe("string");
      expect(ROUTER_STATE_KEY.length).toBeGreaterThan(0);
    });

    it("MATCH_CONTEXT_KEY should be a string", async () => {
      const { MATCH_CONTEXT_KEY } = await import("../../src/context/keys.js");
      expect(typeof MATCH_CONTEXT_KEY).toBe("string");
      expect(MATCH_CONTEXT_KEY.length).toBeGreaterThan(0);
    });

    it("all keys should be unique", async () => {
      const { ROUTER_CONTEXT_KEY, ROUTER_STATE_KEY, MATCH_CONTEXT_KEY } =
        await import("../../src/context/keys.js");
      const keys = [ROUTER_CONTEXT_KEY, ROUTER_STATE_KEY, MATCH_CONTEXT_KEY];
      expect(new Set(keys).size).toBe(3);
    });
  });

  describe("negative — hooks outside provider", () => {
    it("useRouter should return undefined when called outside provider", () => {
      render(UseRouterHarness);
      expect(screen.getByTestId("has-router").textContent).toBe("false");
    });
  });
});
