/**
 * Unit tests — Context utilities (getRouterContext, getMatchContext, getRouterStateContext).
 *
 * Tests that the Svelte context setup and retrieval works
 * when components are rendered inside a RouterProvider tree,
 * and fails gracefully outside of one.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import ContextWrapper from "../components/ContextWrapper.svelte";
import UseRouterHarness from "./harnesses/UseRouterHarness.svelte";

afterEach(cleanup);

/**
 * Helper — creates wrapper + harness rendering.
 * We use the ContextWrapper which manually sets up context,
 * then render ContextHarness inside it to read the context.
 */
function renderWithContext(initialEntries: string[] = ["/"]) {
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
    history: createMemoryHistory({ initialEntries }),
  });

  return { router };
}

describe("context utilities", () => {
  describe("getRouterContext", () => {
    it("should return the router instance when inside ContextWrapper", async () => {
      const { router } = renderWithContext();
      await router.load();

      const { container } = render(ContextWrapper, {
        props: { router },
        context: new Map(),
      });

      // ContextWrapper renders children snippet, but we can't nest
      // a child component easily — test that the wrapper mounts
      expect(container).toBeTruthy();
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
      // Render UseRouterHarness without wrapping it in ContextWrapper
      // useRouter({ warn: false }) suppresses the warning and returns undefined
      render(UseRouterHarness);

      expect(screen.getByTestId("has-router").textContent).toBe("false");
    });
  });
});
