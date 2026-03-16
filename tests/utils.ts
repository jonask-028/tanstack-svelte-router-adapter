/**
 * Shared test utilities for @tanstack/svelte-router.
 *
 * Provides common router setup helpers to avoid duplicating route tree
 * construction across test files. All test files should use these helpers
 * rather than defining local router factories.
 */
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../src";
import type { AnyRoute, RouterHistory, RouterOptions } from "../src";

// ---------------------------------------------------------------------------
// Route override options — covers all route configuration used across tests
// ---------------------------------------------------------------------------

export interface RouteOverrides {
  rootBeforeLoad?: () => any;
  rootComponent?: any;
  rootValidateSearch?: (search: Record<string, unknown>) => any;
  indexLoader?: () => Promise<any> | any;
  indexComponent?: any;
  aboutLoader?: () => Promise<any> | any;
  aboutComponent?: any;
  postsLoader?: () => Promise<any> | any;
  postsComponent?: any;
  postLoader?: (opts: any) => Promise<any> | any;
  postComponent?: any;
  searchValidateSearch?: (search: Record<string, unknown>) => any;
  searchComponent?: any;
  errorComponent?: any;
  errorLoader?: () => Promise<any> | any;
  /** Component for the error route's error boundary */
  errorErrorComponent?: any;
}

/**
 * Create a standard test router with common routes.
 *
 * Routes: /, /about, /posts, /posts/$postId, /search
 *
 * Accepts optional route overrides for loaders, components, and validateSearch,
 * plus additional router-level options.
 */
export function createTestRouter(
  initialUrl = "/",
  routeOverrides?: RouteOverrides,
  routerOptions?: Partial<RouterOptions<AnyRoute, "never", any, any, any>>,
) {
  const rootRoute = createRootRoute({
    beforeLoad: routeOverrides?.rootBeforeLoad,
    component: routeOverrides?.rootComponent,
    validateSearch: routeOverrides?.rootValidateSearch,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    loader: routeOverrides?.indexLoader,
    component: routeOverrides?.indexComponent,
  });

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
    loader: routeOverrides?.aboutLoader,
    component: routeOverrides?.aboutComponent,
  });

  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
    loader: routeOverrides?.postsLoader,
    component: routeOverrides?.postsComponent,
  });

  const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$postId",
    loader: routeOverrides?.postLoader,
    component: routeOverrides?.postComponent,
  });

  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/search",
    validateSearch: routeOverrides?.searchValidateSearch,
    component: routeOverrides?.searchComponent,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    aboutRoute,
    postsRoute.addChildren([postRoute]),
    searchRoute,
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    ...routerOptions,
  } as any);

  return {
    router,
    routes: {
      rootRoute,
      indexRoute,
      aboutRoute,
      postsRoute,
      postRoute,
      searchRoute,
    },
  };
}

/**
 * Create a simple two-route router with just / and /about.
 */
export function createSimpleRouter(initialUrl = "/") {
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
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
  });
}

/**
 * Create a Link/Navigate test router with /, /about, /posts, /posts/$postId.
 *
 * Replaces the local `createLinkTestRouter` and `createNavTestRouter` helpers
 * previously duplicated in Link.test.ts and Navigate.test.ts.
 */
export function createLinkTestRouter(initialEntries: string[] = ["/"]) {
  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/about",
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
    indexRoute,
    aboutRoute,
    postsRoute.addChildren([postRoute]),
  ]);

  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries }),
  });
}

/**
 * Create a navigation test router with deeply nested param routes.
 *
 * Routes: /, /posts, /posts/$slug, /p, /p/$projectId, /p/$projectId/$version,
 *         /p/$projectId/$version/$framework
 *
 * Replaces the local `createTestRouter` previously in navigate.test.ts.
 */
export function createNavigateTestRouter(initialHistory?: RouterHistory) {
  const history =
    initialHistory ?? createMemoryHistory({ initialEntries: ["/"] });

  const rootRoute = createRootRoute({});
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
  });
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/posts",
  });
  const postIdRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: "/$slug",
  });
  const projectRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/p",
  });
  const projectIdRoute = createRoute({
    getParentRoute: () => projectRoute,
    path: "/$projectId",
  });
  const projectVersionRoute = createRoute({
    getParentRoute: () => projectIdRoute,
    path: "/$version",
  });
  const projectFrameRoute = createRoute({
    getParentRoute: () => projectVersionRoute,
    path: "/$framework",
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    postsRoute.addChildren([postIdRoute]),
    projectRoute.addChildren([
      projectIdRoute.addChildren([
        projectVersionRoute.addChildren([projectFrameRoute]),
      ]),
    ]),
  ]);

  const router = createRouter({ routeTree, history } as any);

  return { router, routes: { indexRoute, postsRoute, postIdRoute } };
}

/**
 * Safely query a link anchor element via a test-id span.
 *
 * Throws a descriptive error instead of returning null when the anchor
 * is not found (avoids non-null assertion `!` in test code).
 */
export function getLinkFromTestId(
  screen: { getByTestId: (id: string) => HTMLElement },
  testId = "link-text",
): HTMLAnchorElement {
  const span = screen.getByTestId(testId);
  const anchor = span.closest("a");
  if (!anchor) {
    throw new Error(
      `Expected <a> ancestor for element with data-testid="${testId}", but none was found.`,
    );
  }
  return anchor;
}

/**
 * Parse JSON text content from a test-id element with a clear error on failure.
 *
 * Replaces the fragile `JSON.parse(el.textContent ?? "{}")` pattern used
 * throughout hook harness tests.
 */
export function parseTestIdJSON(
  screen: { getByTestId: (id: string) => HTMLElement },
  testId: string,
): unknown {
  const el = screen.getByTestId(testId);
  const text = el.textContent;
  if (text == null || text === "") {
    throw new Error(
      `Expected JSON text content in element with data-testid="${testId}", but it was empty.`,
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Failed to parse JSON from data-testid="${testId}". Content was: "${text}"`,
    );
  }
}

/** Duration constant for history tick-based tests (replaces magic numbers). */
export const HISTORY_TICK_MS = 100;
