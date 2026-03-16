/**
 * Navigate component tests.
 *
 * Tests that Navigate:
 * - Triggers navigation on mount
 * - Uses replace by default
 * - Supports params and search
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { render, waitFor, cleanup } from "@testing-library/svelte";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestNavigate from "./TestNavigate.svelte";
import { createLinkTestRouter } from "../utils";

describe("Navigate component", () => {
  afterEach(() => {
    cleanup();
  });
  it("should navigate on mount", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestNavigate, {
      props: {
        router,
        to: "/about",
      },
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });

  it("should use replace by default", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    const navigateSpy = vi.spyOn(router, "navigate");

    render(TestNavigate, {
      props: {
        router,
        to: "/about",
      },
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "/about",
          replace: true,
        }),
      );
    });
  });

  it("should support replace=false", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    const navigateSpy = vi.spyOn(router, "navigate");

    render(TestNavigate, {
      props: {
        router,
        to: "/about",
        replace: false,
      },
    });

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "/about",
          replace: false,
        }),
      );
    });
  });

  it("should navigate with params", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestNavigate, {
      props: {
        router,
        to: "/posts/$postId",
        params: { postId: "42" },
      },
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/posts/42");
    });
  });

  it("should navigate with search params", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestNavigate, {
      props: {
        router,
        to: "/about",
        search: { tab: "info" },
      },
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
      expect(router.state.location.search).toEqual(
        expect.objectContaining({ tab: "info" }),
      );
    });
  });

  it("should navigate with hash", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestNavigate, {
      props: {
        router,
        to: "/about",
        hash: "section-1",
      },
    });

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
      expect(router.state.location.hash).toBe("section-1");
    });
  });
});
