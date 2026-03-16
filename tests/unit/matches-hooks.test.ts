/**
 * Unit tests — useMatches, useParentMatches, useChildMatches hooks
 * rendered inside real Svelte components.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "../components/TestRouterProvider.svelte";
import UseMatchesHarness from "./harnesses/UseMatchesHarness.svelte";
import UseParentMatchesHarness from "./harnesses/UseParentMatchesHarness.svelte";
import UseChildMatchesHarness from "./harnesses/UseChildMatchesHarness.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// useMatches
// ---------------------------------------------------------------------------
describe("useMatches (rendered)", () => {
  it("should return all matches for a root-level route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseMatchesHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("matches-count").textContent).toBe("2");
      const ids = JSON.parse(
        screen.getByTestId("matches-ids").textContent ?? "[]",
      );
      expect(ids).toContain("__root__");
      expect(ids).toContain("/");
    });
  });

  it("should return all matches for a nested route", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      component: UseMatchesHarness,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/123"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("matches-count").textContent).toBe("3");
      const ids = JSON.parse(
        screen.getByTestId("matches-ids").textContent ?? "[]",
      );
      expect(ids).toEqual(["__root__", "/posts", "/posts/$postId"]);
    });
  });
});

// ---------------------------------------------------------------------------
// useParentMatches
// ---------------------------------------------------------------------------
describe("useParentMatches (rendered)", () => {
  it("should return empty for root route component", async () => {
    const rootRoute = createRootRoute({ component: UseParentMatchesHarness });
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
      expect(screen.getByTestId("parent-matches-count").textContent).toBe("0");
    });
  });

  it("should return root match for a child route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseParentMatchesHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("parent-matches-count").textContent).toBe("1");
      const ids = JSON.parse(
        screen.getByTestId("parent-matches-ids").textContent ?? "[]",
      );
      expect(ids).toEqual(["__root__"]);
    });
  });

  it("should return parent chain for deeply nested route", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      component: UseParentMatchesHarness,
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
      expect(screen.getByTestId("parent-matches-count").textContent).toBe("2");
      const ids = JSON.parse(
        screen.getByTestId("parent-matches-ids").textContent ?? "[]",
      );
      expect(ids).toEqual(["__root__", "/posts"]);
    });
  });
});

// ---------------------------------------------------------------------------
// useChildMatches
// ---------------------------------------------------------------------------
describe("useChildMatches (rendered)", () => {
  it("should return child matches from root route component", async () => {
    const rootRoute = createRootRoute({ component: UseChildMatchesHarness });
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
      expect(screen.getByTestId("child-matches-count").textContent).toBe("1");
      const ids = JSON.parse(
        screen.getByTestId("child-matches-ids").textContent ?? "[]",
      );
      expect(ids).toEqual(["/"]);
    });
  });

  it("should return empty for leaf route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseChildMatchesHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("child-matches-count").textContent).toBe("0");
    });
  });

  it("should return nested children from middle route", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      component: UseChildMatchesHarness,
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
      history: createMemoryHistory({ initialEntries: ["/posts/99"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("child-matches-count").textContent).toBe("1");
      const ids = JSON.parse(
        screen.getByTestId("child-matches-ids").textContent ?? "[]",
      );
      expect(ids).toEqual(["/posts/$postId"]);
    });
  });
});
