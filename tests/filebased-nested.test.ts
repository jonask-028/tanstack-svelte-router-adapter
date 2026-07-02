/**
 * Reproduction: file-based nested route rendering.
 *
 * The router generator builds the route tree by:
 *   1. creating each route with `createFileRoute(path)(options)` (no parent/id),
 *   2. calling `.update({ id, path, getParentRoute })` to wire it, then
 *   3. `_addFileChildren(...)` / `_addFileTypes()` to assemble the tree.
 *
 * A nested *parent* route (a route that has child routes) built this way must
 * still render its own component. This test pins that behaviour.
 */
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import {
  createRootRoute,
  createRoute,
  createFileRoute,
  createRouter,
} from "../src";
import TestRouterProvider from "./components/TestRouterProvider.svelte";
import RootLayout from "./e2e/pages/RootLayout.svelte";
import PostsLayout from "./e2e/pages/PostsLayout.svelte";
import PostPage from "./e2e/pages/PostPage.svelte";

afterEach(cleanup);

describe("nested routes — manual createRoute (control)", () => {
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
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("posts-layout")).toBeInTheDocument();
    });
  });
});

describe("nested routes — file-based createFileRoute (generated-tree shape)", () => {
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

    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    await router.load();
    render(TestRouterProvider, { props: { router } });

    await waitFor(() => {
      expect(screen.getByTestId("posts-layout")).toBeInTheDocument();
    });
  });
});
