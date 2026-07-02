/**
 * useParams strict:false test — mirrors React/Vue adapter's useParams.test.tsx.
 *
 * Tests that useParams with strict:false returns parsed params after navigation.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../../src";
import TestRouterProvider from "../components/TestRouterProvider.svelte";
import UseParamsLooseHarness from "./harnesses/UseParamsLooseHarness.svelte";
import { parseTestIdJSON } from "../utils";

afterEach(cleanup);

describe("useParams strict:false", () => {
  it("should return parsed params with strict: false", async () => {
    const rootRoute = createRootRoute({
      component: UseParamsLooseHarness,
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const params = parseTestIdJSON(screen, "params-loose") as any;
      expect(params.postId).toBe("42");
    });
  });

  it("should return empty params with strict: false on non-param route", async () => {
    const rootRoute = createRootRoute({
      component: UseParamsLooseHarness,
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

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const params = parseTestIdJSON(screen, "params-loose") as any;
      expect(params).toEqual({});
    });
  });

  it("should return updated params after child navigation with strict: false", async () => {
    const rootRoute = createRootRoute({
      component: UseParamsLooseHarness,
    });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/1"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // Initially at /posts/1
    await waitFor(() => {
      const params = parseTestIdJSON(screen, "params-loose") as any;
      expect(params.postId).toBe("1");
    });

    // Navigate to /posts/2
    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    // Params should update to reflect the new postId
    await waitFor(() => {
      const params = parseTestIdJSON(screen, "params-loose") as any;
      expect(params.postId).toBe("2");
    });
  });
});
