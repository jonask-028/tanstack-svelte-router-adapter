/**
 * E2E Integration Tests
 *
 * These tests verify full user flows by rendering a real RouterProvider
 * with route components, then asserting on the rendered DOM. This exercises
 * the entire rendering pipeline: RouterProvider → Matches → Match → Component → Outlet.
 */
import { describe, expect, it, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestRouterProvider from "../components/TestRouterProvider.svelte";
import { HISTORY_TICK_MS } from "../utils";

// E2E page components
import HomePage from "./pages/HomePage.svelte";
import AboutPage from "./pages/AboutPage.svelte";
import DataPage from "./pages/DataPage.svelte";
import SearchPage from "./pages/SearchPage.svelte";
import PostPage from "./pages/PostPage.svelte";
import RootLayout from "./pages/RootLayout.svelte";
import PostsLayout from "./pages/PostsLayout.svelte";
import PostsIndex from "./pages/PostsIndex.svelte";
import ErrorPage from "./pages/ErrorPage.svelte";
import NotFoundPage from "./pages/NotFoundPage.svelte";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/**
 * Build a full route tree with route components.
 */
function buildAppRouter(initialEntries: string[] = ["/"]) {
  const rootRoute = createRootRoute({
    component: RootLayout,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    component: AboutPage,
  });

  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
    component: PostsLayout,
  });

  const postsIndexRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/",
    component: PostsIndex,
  });

  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$postId",
    component: PostPage,
  });

  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/search",
    component: SearchPage,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    postsRoute.addChildren([postsIndexRoute, postRoute]),
    searchRoute,
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
describe("E2E: Initial rendering", () => {
  it("should render the home page at /", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Home Page" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
    });
  });

  it("should render the about page at /about", async () => {
    const router = buildAppRouter(["/about"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "About Page" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("root-layout")).toBeInTheDocument();
    });
  });

  it("should render the layout pathname", async () => {
    const router = buildAppRouter(["/about"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("layout-pathname").textContent).toBe("/about");
    });
  });
});

// ---------------------------------------------------------------------------
// Nested routes
// ---------------------------------------------------------------------------
describe("E2E: Nested routes", () => {
  it("should render PostsLayout with PostsIndex at /posts", async () => {
    const router = buildAppRouter(["/posts"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Posts" }),
      ).toBeInTheDocument();
      expect(screen.getByTestId("posts-index")).toBeInTheDocument();
    });
  });

  it("should render post detail inside PostsLayout at /posts/42", async () => {
    const router = buildAppRouter(["/posts/42"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Posts" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Post Detail" }),
      ).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Search params
// ---------------------------------------------------------------------------
describe("E2E: Search params", () => {
  it("should render search params on the SearchPage", async () => {
    const router = buildAppRouter(["/search?q=svelte&page=2"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Search Page" }),
      ).toBeInTheDocument();
      expect(screen.getByText("svelte")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Loader data
// ---------------------------------------------------------------------------
describe("E2E: Loaders", () => {
  it("should display loader data in a route component", async () => {
    const rootRoute = createRootRoute({});
    const dataRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/data",
      component: DataPage,
      loader: async () => ({ message: "Hello from loader", count: 42 }),
    });

    const routeTree = rootRoute.addChildren([dataRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/data"] }),
    });

    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByText("Hello from loader")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Programmatic navigation
// ---------------------------------------------------------------------------
describe("E2E: Programmatic navigation", () => {
  it("should navigate from / to /about programmatically", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    // Navigate programmatically
    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
      expect(screen.getByTestId("layout-pathname").textContent).toBe("/about");
    });
  });

  it("should navigate to a nested route with params", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    await router.navigate({ to: "/posts/$postId", params: { postId: "7" } });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("post-page")).toBeInTheDocument();
      expect(screen.getByTestId("post-id").textContent).toBe("7");
    });
  });

  it("should navigate with search params", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    await router.navigate({
      to: "/search",
      search: { q: "tanstack", page: 5 },
    } as any);
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("search-page")).toBeInTheDocument();
      expect(screen.getByTestId("search-q").textContent).toBe("tanstack");
      expect(screen.getByTestId("search-page-num").textContent).toBe("5");
    });
  });
});

// ---------------------------------------------------------------------------
// Back/forward navigation
// ---------------------------------------------------------------------------
describe("E2E: History navigation", () => {
  it("should go back after navigating", async () => {
    vi.useFakeTimers();
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    // Navigate forward
    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
    });

    expect(router.state.location.pathname).toBe("/about");

    router.history.back();
    await vi.advanceTimersByTimeAsync(HISTORY_TICK_MS);
    await router.load();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });

    vi.useRealTimers();
  });

  it("should go forward after going back", async () => {
    vi.useFakeTimers();
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    // Navigate to about
    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(screen.getByTestId("about-page")).toBeInTheDocument();
    });

    // Go back
    router.history.back();
    await vi.advanceTimersByTimeAsync(HISTORY_TICK_MS);
    await router.load();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });

    // Go forward
    router.history.forward();
    await vi.advanceTimersByTimeAsync(HISTORY_TICK_MS);
    await router.load();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });

    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Error boundary
// ---------------------------------------------------------------------------
describe("E2E: Error handling", () => {
  it("should render error component when loader throws", async () => {
    const rootRoute = createRootRoute({});
    const errorRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/error",
      component: DataPage,
      errorComponent: ErrorPage,
      loader: async () => {
        throw new Error("Loader failed!");
      },
    });

    const routeTree = rootRoute.addChildren([errorRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/error"] }),
    });

    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Error!" }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Loader failed!/)).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Navigation state
// ---------------------------------------------------------------------------
describe("E2E: Router state", () => {
  it("should update router state after navigation", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    expect(router.state.location.pathname).toBe("/");

    await router.navigate({ to: "/about" });
    await router.invalidate();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });

  it("should have correct matches after navigation", async () => {
    const router = buildAppRouter(["/"]);
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await router.navigate({ to: "/posts/99" } as any);
    await router.invalidate();

    await waitFor(() => {
      const matchIds = router.state.matches.map((m) => m.routeId);
      expect(matchIds).toContain("/posts/$postId");
      const postMatch = router.state.matches.find(
        (m) => m.routeId === "/posts/$postId",
      );
      expect(postMatch?.params).toEqual({ postId: "99" });
    });
  });
});
