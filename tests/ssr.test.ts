// @vitest-environment node
/**
 * SSR tests — renderRouterToString, renderRouterToStream.
 *
 * Tests the server-side rendering utilities including:
 * - Router isServer flag
 * - Redirect handling
 * - Actual HTML output from renderRouterToString
 * - Streaming output from renderRouterToStream
 * - Status code propagation
 */
import { describe, expect, it } from "vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "../src";
import { renderRouterToString, renderRouterToStream } from "../src/ssr/server";
import TestApp from "./ssr/TestApp.svelte";

// ---------------------------------------------------------------------------
// Router setup helpers
// ---------------------------------------------------------------------------
describe("SSR router setup", () => {
  it("router should support isServer flag", async () => {
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

    router.isServer = true;
    await router.load();

    expect(router.isServer).toBe(true);
    expect(router.state.matches.length).toBeGreaterThan(0);
  });

  it("router state should have statusCode for SSR responses", async () => {
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

    router.isServer = true;
    await router.load();

    expect(router.state.statusCode).toBe(200);
  });

  it("router should load on server with correct pathname", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });

    router.isServer = true;
    await router.load();

    expect(router.state.location.pathname).toBe("/about");
    expect(router.state.matches.some((m) => m.routeId === "/about")).toBe(true);
  });

  it("redirect function creates a Response with correct status", async () => {
    const redirectResponse = redirect({
      to: "/target",
      statusCode: 302,
    } as any);
    expect(redirectResponse).toBeDefined();
    expect(redirectResponse).toBeInstanceOf(Response);
    expect((redirectResponse as Response).status).toBe(302);
    expect((redirectResponse as any).options.to).toBe("/target");
  });
});

// ---------------------------------------------------------------------------
// renderRouterToString
// ---------------------------------------------------------------------------
describe("renderRouterToString", () => {
  it("should return a Response with HTML content", async () => {
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
    router.isServer = true;
    await router.load();

    const response = await renderRouterToString({
      router,
      responseHeaders: new Headers({ "Content-Type": "text/html" }),
      App: TestApp as any,
    });

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
  });

  it("should contain the rendered pathname in HTML", async () => {
    const rootRoute = createRootRoute({});
    const aboutRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/about",
    });
    const routeTree = rootRoute.addChildren([aboutRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/about"] }),
    });
    router.isServer = true;
    await router.load();

    const response = await renderRouterToString({
      router,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });

    const html = await response.text();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("/about");
  });

  it("should render route match IDs into the HTML", async () => {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const routeTree = rootRoute.addChildren([postsRoute]);
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/posts"] }),
    });
    router.isServer = true;
    await router.load();

    const response = await renderRouterToString({
      router,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });

    const html = await response.text();
    expect(html).toContain("/posts");
    expect(html).toContain("__root__");
  });

  it("should propagate status code from router state", async () => {
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
    router.isServer = true;
    await router.load();

    const response = await renderRouterToString({
      router,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });

    expect(response.status).toBe(200);
  });

  it("should include custom response headers", async () => {
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
    router.isServer = true;
    await router.load();

    const headers = new Headers({
      "Content-Type": "text/html; charset=UTF-8",
      "X-Custom": "test-header",
    });

    const response = await renderRouterToString({
      router,
      responseHeaders: headers,
      App: TestApp as any,
    });

    expect(response.headers.get("X-Custom")).toBe("test-header");
  });
});

// ---------------------------------------------------------------------------
// renderRouterToStream
// ---------------------------------------------------------------------------
describe("renderRouterToStream", () => {
  it("should return a Response with a ReadableStream body", async () => {
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
    router.isServer = true;
    await router.load();

    const response = await renderRouterToStream({
      request: new Request("http://localhost/"),
      router,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });

    expect(response).toBeInstanceOf(Response);
    expect(response.body).toBeInstanceOf(ReadableStream);
  });

  it("should produce HTML that matches renderRouterToString", async () => {
    const rootRoute = createRootRoute({});
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
    });
    const routeTree = rootRoute.addChildren([indexRoute]);

    // String render
    const router1 = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    router1.isServer = true;
    await router1.load();
    const stringResponse = await renderRouterToString({
      router: router1,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });
    const stringHtml = await stringResponse.text();

    // Stream render
    const router2 = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/"] }),
    });
    router2.isServer = true;
    await router2.load();
    const streamResponse = await renderRouterToStream({
      request: new Request("http://localhost/"),
      router: router2,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });
    const streamHtml = await streamResponse.text();

    expect(streamHtml).toBe(stringHtml);
  });

  it("should propagate status code", async () => {
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
    router.isServer = true;
    await router.load();

    const response = await renderRouterToStream({
      request: new Request("http://localhost/"),
      router,
      responseHeaders: new Headers(),
      App: TestApp as any,
    });

    expect(response.status).toBe(200);
  });
});
