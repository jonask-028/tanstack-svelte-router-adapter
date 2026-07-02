// @vitest-environment node
/**
 * Reproduction: file-based nested route rendering during SSR.
 *
 * Mirrors tests/filebased-nested.test.ts but exercises the *server* render
 * path (`renderRouterToString`) instead of the jsdom client render, since the
 * Start adapter reported nested parent routes rendering empty during SSR.
 */
import { describe, expect, it } from "vitest";
import { createMemoryHistory } from "@tanstack/history";
import {
  createRootRoute,
  createRoute,
  createFileRoute,
  createRouter,
} from "../src";
import { renderRouterToString } from "../src/ssr/server";
import RootLayout from "./e2e/pages/RootLayout.svelte";
import PostsLayout from "./e2e/pages/PostsLayout.svelte";
import PostPage from "./e2e/pages/PostPage.svelte";

async function renderAt(routeTree: any, path: string): Promise<string> {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  (router as any).isServer = true;
  await router.load();
  const res = renderRouterToString({ router, responseHeaders: new Headers() });
  return res.text();
}

describe("SSR nested routes — manual createRoute (control)", () => {
  it("renders the parent layout at the parent path", async () => {
    const rootRoute = createRootRoute({ component: RootLayout });
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
      component: PostsLayout,
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "$postId",
      component: PostPage,
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);

    const html = await renderAt(routeTree, "/posts");
    expect(html).toContain("posts-layout");
  });
});

describe("SSR nested routes — file-based createFileRoute (generated-tree shape)", () => {
  it("renders the parent layout at the parent path", async () => {
    const rootRoute: any = createRootRoute({ component: RootLayout });

    const PostsImport: any = createFileRoute("/posts" as any)({
      component: PostsLayout,
    } as any);
    const PostImport: any = createFileRoute("/posts/$postId" as any)({
      component: PostPage,
    } as any);

    const PostsRoute = PostsImport.update({
      id: "/posts",
      path: "/posts",
      getParentRoute: () => rootRoute,
    });
    const PostRoute = PostImport.update({
      id: "/$postId",
      path: "/$postId",
      getParentRoute: () => PostsRoute,
    });

    const PostsRouteWithChildren = PostsRoute._addFileChildren({ PostRoute });
    const routeTree = rootRoute
      ._addFileChildren({ PostsRoute: PostsRouteWithChildren })
      ._addFileTypes();

    const html = await renderAt(routeTree, "/posts");
    expect(html).toContain("posts-layout");
  });
});
