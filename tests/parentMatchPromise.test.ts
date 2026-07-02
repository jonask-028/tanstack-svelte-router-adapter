/**
 * Loader parentMatchPromise test — mirrors React/Vue adapter pattern.
 *
 * Tests that child loaders receive parentMatchPromise for coordinating
 * with parent loader completion.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "../src";

afterEach(() => {
  vi.resetAllMocks();
});

describe("loader parentMatchPromise", () => {
  it("should provide parentMatchPromise to child loader", async () => {
    const childLoaderMock = vi.fn();
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { posts: [1, 2, 3] };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: (opts: any) => {
        childLoaderMock(opts);
        return { post: "detail" };
      },
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    expect(childLoaderMock).toHaveBeenCalled();
    const opts = childLoaderMock.mock.calls[0]![0];
    expect(opts.parentMatchPromise).toBeDefined();
  });

  it("should resolve parentMatchPromise with parent match data", async () => {
    let resolvedParent: any;
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      loader: async () => {
        await new Promise((r) => setTimeout(r, 10));
        return { posts: ["a", "b"] };
      },
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$postId",
      loader: async ({ parentMatchPromise }: any) => {
        resolvedParent = await parentMatchPromise;
        return { post: "detail" };
      },
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts/42"] }),
    });
    await router.load();

    expect(resolvedParent).toBeDefined();
    expect(resolvedParent?.loaderData).toEqual({ posts: ["a", "b"] });
  });
});
