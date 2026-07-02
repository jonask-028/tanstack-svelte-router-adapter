/**
 * URL encoding tests for splat segments and additional param edge cases.
 * Mirrors React/Vue adapter's comprehensive encoding tests.
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

// ---------------------------------------------------------------------------
// Splat segment encoding
// ---------------------------------------------------------------------------

describe("encoding: URL splat segments", () => {
  function createSplatRouter(initialUrl: string) {
    const rootRoute = createRootRoute({});
    const filesRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/files/$",
    });
    const routeTree = rootRoute.addChildren([filesRoute]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [initialUrl] }),
    });
  }

  it.each([
    {
      input: "/files/docs/readme.md",
      expected: "/files/docs/readme.md",
      label: "nested path",
    },
    {
      input: "/files/hello%20world.txt",
      expected: "/files/hello world.txt",
      label: "space encoded",
    },
    {
      input: "/files/path/to/file%2Fname",
      expected: "/files/path/to/file%2Fname",
      label: "encoded slash",
    },
    {
      input: "/files/unicode/🚀",
      expected: "/files/unicode/🚀",
      label: "unicode emoji",
    },
    {
      input: "/files/special/a+b",
      expected: "/files/special/a+b",
      label: "plus sign",
    },
  ])("should handle $label ($input)", async ({ input, expected }) => {
    const router = createSplatRouter(input);
    await router.load();
    expect(router.state.location.pathname).toBe(expected);
  });

  it("should match splat route", async () => {
    const router = createSplatRouter("/files/a/b/c");
    await router.load();
    expect(router.state.matches.map((m) => m.routeId)).toContain("/files/$");
  });
});

// ---------------------------------------------------------------------------
// Additional param encoding edge cases
// ---------------------------------------------------------------------------

describe("encoding: additional param edge cases", () => {
  function createParamRouter(initialUrl: string) {
    const rootRoute = createRootRoute({});
    const postsRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/posts",
    });
    const postRoute = createRoute({
      getParentRoute: () => postsRoute,
      path: "/$slug",
    });
    const routeTree = rootRoute.addChildren([
      postsRoute.addChildren([postRoute]),
    ]);
    return createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [initialUrl] }),
    });
  }

  it.each([
    {
      input: "/posts/hello-world",
      expected: "hello-world",
      label: "hyphenated",
    },
    {
      input: "/posts/hello_world",
      expected: "hello_world",
      label: "underscored",
    },
    {
      input: "/posts/UPPERCASE",
      expected: "UPPERCASE",
      label: "uppercase",
    },
    {
      input: "/posts/123",
      expected: "123",
      label: "numeric",
    },
    {
      input: "/posts/hello%20world",
      expected: "hello world",
      label: "space encoded",
    },
    {
      input: "/posts/%E4%B8%AD%E6%96%87",
      expected: "中文",
      label: "CJK characters",
    },
  ])("should decode $label param ($input)", async ({ input, expected }) => {
    const router = createParamRouter(input);
    await router.load();
    const match = router.state.matches.find(
      (m) => m.routeId === "/posts/$slug",
    );
    expect(match?.params.slug).toBe(expected);
  });
});
