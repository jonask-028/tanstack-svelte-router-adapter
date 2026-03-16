/**
 * Unit tests — Hooks rendered inside real Svelte components.
 *
 * Unlike hooks.test.ts (which tests logic via router.state directly),
 * these tests render harness components as actual route components
 * inside RouterProvider, exercising the full context chain:
 * RouterProvider → Matches → Match → HarnessComponent.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "../components/TestRouterProvider.svelte";
import { parseTestIdJSON } from "../utils";
import UseRouterHarness from "./harnesses/UseRouterHarness.svelte";
import UseRouterStateHarness from "./harnesses/UseRouterStateHarness.svelte";
import UseMatchHarness from "./harnesses/UseMatchHarness.svelte";
import UseParamsHarness from "./harnesses/UseParamsHarness.svelte";
import UseSearchHarness from "./harnesses/UseSearchHarness.svelte";
import UseLocationHarness from "./harnesses/UseLocationHarness.svelte";
import UseNavigateHarness from "./harnesses/UseNavigateHarness.svelte";
import UseLoaderDataHarness from "./harnesses/UseLoaderDataHarness.svelte";
import UseLoaderDepsHarness from "./harnesses/UseLoaderDepsHarness.svelte";
import UseRouteContextHarness from "./harnesses/UseRouteContextHarness.svelte";
import UseCanGoBackHarness from "./harnesses/UseCanGoBackHarness.svelte";
import UseMatchRouteHarness from "./harnesses/UseMatchRouteHarness.svelte";
import UseLocationDirectHarness from "./harnesses/UseLocationDirectHarness.svelte";
import UseBlockerHarness from "./harnesses/UseBlockerHarness.svelte";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// useRouter
// ---------------------------------------------------------------------------
describe("useRouter (rendered)", () => {
  it("should find the router inside RouterProvider", async () => {
    const rootRoute = createRootRoute({ component: UseRouterHarness });
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
      expect(screen.getByTestId("has-error").textContent).toBe("false");
    });
  });

  it("should expose router state pathname", async () => {
    const rootRoute = createRootRoute({ component: UseRouterHarness });
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
      expect(screen.getByTestId("router-state-pathname").textContent).toBe(
        "/about",
      );
    });
  });
});

// ---------------------------------------------------------------------------
// useRouterState
// ---------------------------------------------------------------------------
describe("useRouterState (rendered)", () => {
  it("should return pathname via selector", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseRouterStateHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("pathname").textContent).toBe("/");
      expect(screen.getByTestId("match-count").textContent).not.toBe("0");
    });
  });

  it("should return search params via selector", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseRouterStateHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/?q=hello&page=3"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const parsed = parseTestIdJSON(screen, "search") as any;
      expect(parsed.q).toBe("hello");
      expect(parsed.page).toBe(3);
    });
  });
});

// ---------------------------------------------------------------------------
// useMatch
// ---------------------------------------------------------------------------
describe("useMatch (rendered)", () => {
  it("should return match info when rendered as route component", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseMatchHarness,
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      // useMatch without `from` uses getMatchContext() which returns the current match ID
      expect(screen.getByTestId("match-route-id").textContent).toBe("/about");
      expect(screen.getByTestId("match-status").textContent).toBe("success");
    });
  });

  it("should return params for parameterized routes", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      component: UseMatchHarness,
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
      expect(parseTestIdJSON(screen, "match-params")).toEqual({ postId: "42" });
    });
  });
});

// ---------------------------------------------------------------------------
// useParams
// ---------------------------------------------------------------------------
describe("useParams (rendered)", () => {
  it("should return route params", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      component: UseParamsHarness,
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
      expect(parseTestIdJSON(screen, "params")).toEqual({ postId: "99" });
    });
  });

  it("should return empty params for non-parameterized routes", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseParamsHarness,
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(parseTestIdJSON(screen, "params")).toEqual({});
    });
  });
});

// ---------------------------------------------------------------------------
// useSearch
// ---------------------------------------------------------------------------
describe("useSearch (rendered)", () => {
  it("should return parsed search params", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseSearchHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/?q=svelte&page=2"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const parsed = parseTestIdJSON(screen, "search") as any;
      expect(parsed.q).toBe("svelte");
      expect(parsed.page).toBe(2);
    });
  });

  it("should return empty object when no search params", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseSearchHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(parseTestIdJSON(screen, "search")).toEqual({});
    });
  });
});

// ---------------------------------------------------------------------------
// useLocation
// ---------------------------------------------------------------------------
describe("useLocation (rendered)", () => {
  it("should return location pathname", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseLocationHarness,
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("location-pathname").textContent).toBe(
        "/about",
      );
    });
  });

  it("should return location search and hash", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseLocationHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/?q=test#section"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("location-pathname").textContent).toBe("/");
      expect(parseTestIdJSON(screen, "location-search")).toEqual({ q: "test" });
      expect(screen.getByTestId("location-hash").textContent).toBe("section");
    });
  });
});

// ---------------------------------------------------------------------------
// useNavigate (rendered)
// ---------------------------------------------------------------------------
describe("useNavigate (rendered)", () => {
  it("should return a navigate function", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseNavigateHarness,
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

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("has-navigate").textContent).toBe("true");
    });
  });

  it("should navigate when called", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseNavigateHarness,
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

    render(TestRouterProvider, { props: { router } });

    const user = userEvent.setup();
    const button = screen.getByTestId("do-navigate");
    await user.click(button);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });
});

// ---------------------------------------------------------------------------
// useLoaderData (rendered)
// ---------------------------------------------------------------------------
describe("useLoaderData (rendered)", () => {
  it("should return loader data from the current route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseLoaderDataHarness,
      loader: async () => ({ items: [1, 2, 3] }),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(parseTestIdJSON(screen, "loader-data")).toEqual({
        items: [1, 2, 3],
      });
    });
  });
});

// ---------------------------------------------------------------------------
// useLoaderDeps (rendered)
// ---------------------------------------------------------------------------
describe("useLoaderDeps (rendered)", () => {
  it("should return loader deps from the current route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseLoaderDepsHarness,
      loaderDeps: ({ search }: any) => ({ q: search?.q ?? "default" }),
      loader: async () => ({}),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const deps = parseTestIdJSON(screen, "loader-deps");
      expect(deps).toBeDefined();
    });
  });
});

// ---------------------------------------------------------------------------
// useRouteContext (rendered)
// ---------------------------------------------------------------------------
describe("useRouteContext (rendered)", () => {
  it("should return route context from beforeLoad", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseRouteContextHarness,
      beforeLoad: () => ({ shared: "value" }),
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
      context: { base: "ctx" },
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      const ctx = parseTestIdJSON(screen, "route-context") as any;
      expect(ctx.base).toBe("ctx");
      expect(ctx.shared).toBe("value");
    });
  });
});

// ---------------------------------------------------------------------------
// useCanGoBack (rendered)
// ---------------------------------------------------------------------------
describe("useCanGoBack (rendered)", () => {
  it("should return false when no history", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseCanGoBackHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("can-go-back").textContent).toBe("false");
    });
  });
});

// ---------------------------------------------------------------------------
// useMatchRoute (rendered)
// ---------------------------------------------------------------------------
describe("useMatchRoute (rendered)", () => {
  it("should match the current route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseMatchRouteHarness,
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

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("has-match-route").textContent).toBe("true");
      // Index should match
      const indexMatch = screen.getByTestId("index-match").textContent ?? "";
      expect(indexMatch).not.toBe("false");
      // About should not match
      expect(screen.getByTestId("about-match").textContent).toBe("false");
    });
  });
});

// ---------------------------------------------------------------------------
// useLocation (direct hook — rendered)
// ---------------------------------------------------------------------------
describe("useLocation direct (rendered)", () => {
  it("should return location from the actual useLocation hook", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseLocationDirectHarness,
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about?x=1#top"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("loc-pathname").textContent).toBe("/about");
      const search = parseTestIdJSON(screen, "loc-search") as any;
      expect(search.x).toBe(1);
    });
  });
});

// ---------------------------------------------------------------------------
// useCanGoBack — returns true after navigation
// ---------------------------------------------------------------------------
describe("useCanGoBack after navigation (rendered)", () => {
  it("should return true after navigating to a new route", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseCanGoBackHarness,
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseCanGoBackHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/", "/about"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("can-go-back").textContent).toBe("true");
    });
  });
});

// ---------------------------------------------------------------------------
// useNavigate — hook reactivity after programmatic navigation
// ---------------------------------------------------------------------------
describe("useNavigate reactivity (rendered)", () => {
  it("should navigate and update the rendered route", async () => {
    const user = userEvent.setup();
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: UseNavigateHarness,
    });
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
      component: UseNavigateHarness,
    });
    const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    await router.load();

    render(TestRouterProvider, { props: { router } });

    // Initially at "/"
    await waitFor(() => {
      expect(screen.getByTestId("has-navigate").textContent).toBe("true");
    });

    // Click navigate button → moves to /about
    await user.click(screen.getByTestId("do-navigate"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });
});

// ---------------------------------------------------------------------------
// useBlocker — reactivity test
// ---------------------------------------------------------------------------
describe("useBlocker reactivity (rendered)", () => {
  it("should update UI when blocker status changes from idle to blocked", async () => {
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

    // Initially idle
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("idle");
    });

    // Trigger navigation — should block and update status
    await user.click(screen.getByTestId("trigger-nav"));

    // Status should reactively update to "blocked"
    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });

    // Blocker controls should now be visible
    expect(screen.getByTestId("blocker-proceed")).toBeInTheDocument();
    expect(screen.getByTestId("blocker-reset")).toBeInTheDocument();
    expect(screen.getByTestId("blocker-next-pathname").textContent).toBe(
      "/other",
    );
  });

  it("should reset to idle after proceeding", async () => {
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

    // Trigger navigation
    await user.click(screen.getByTestId("trigger-nav"));

    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });

    // Click proceed
    await user.click(screen.getByTestId("blocker-proceed"));

    // Navigation completes and status returns to idle
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/other");
      expect(screen.getByTestId("blocker-status").textContent).toBe("idle");
    });
  });

  it("should reset to idle after canceling navigation", async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId("blocker-status").textContent).toBe("blocked");
    });

    // Click reset (cancel)
    await user.click(screen.getByTestId("blocker-reset"));

    // Navigation canceled, stays at "/"
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
      expect(screen.getByTestId("blocker-status").textContent).toBe("idle");
    });
  });
});
