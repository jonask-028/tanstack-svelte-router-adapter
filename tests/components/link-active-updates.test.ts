/**
 * Link active/href update timing tests — mirrors React/Vue adapter's
 * "active and href updates" describe block in link.test.tsx.
 *
 * Tests that active state updates correctly when params, search, and hash change.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../../src";
import TestLink from "./TestLink.svelte";
import { getLinkFromTestId } from "../utils";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function getLink(): HTMLAnchorElement {
  return getLinkFromTestId(screen);
}

/** The TestLink harness renders a <span data-active={isActive}> inside the link. */
function getActiveIndicator(): HTMLSpanElement {
  return screen.getByTestId("link-text") as HTMLSpanElement;
}

describe("Link active and href updates", () => {
  it("should update active state when navigating to the link target", async () => {
    const user = userEvent.setup();
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
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    // Initially not active
    await waitFor(() => {
      expect(getActiveIndicator().getAttribute("data-active")).toBe("false");
    });

    // Click to navigate
    const link = getLink();
    await user.click(link);

    // After navigation, link should become active
    await waitFor(() => {
      expect(getActiveIndicator().getAttribute("data-active")).toBe("true");
    });
  });

  it("should update active state when params change", async () => {
    const rootRoute = createRootRoute({});
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

    render(TestLink, {
      props: {
        router,
        to: "/posts/$postId",
        params: { postId: "2" },
        linkText: "Post 2",
      },
    });

    // Link to /posts/2 while at /posts/1 — should be inactive
    await waitFor(() => {
      expect(getActiveIndicator().getAttribute("data-active")).toBe("false");
    });

    // Navigate to /posts/2
    await router.navigate({
      to: "/posts/$postId",
      params: { postId: "2" },
    } as any);
    await router.invalidate();

    // Now the link should be active
    await waitFor(() => {
      expect(getActiveIndicator().getAttribute("data-active")).toBe("true");
    });
  });

  it("should update href when search params change", async () => {
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

    render(TestLink, {
      props: {
        router,
        to: "/",
        search: { q: "hello" },
        linkText: "Search",
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toContain("q=hello");
  });

  it("should update href when hash changes", async () => {
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

    render(TestLink, {
      props: {
        router,
        to: "/",
        hash: "section1",
        linkText: "Section",
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toContain("#section1");
  });

  it("should mark non-matching links as inactive", async () => {
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
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    // Link to a different route should be inactive
    render(TestLink, {
      props: { router, to: "/", linkText: "Home" },
    });

    await waitFor(() => {
      expect(getActiveIndicator().getAttribute("data-active")).toBe("false");
    });
  });
});
