/**
 * Link component tests.
 *
 * Tests that Link:
 * - Renders an <a> element with the correct href
 * - Detects active state and applies activeProps
 * - Handles click events and navigates
 * - Supports disabled state
 * - Handles preload behavior
 * - Forwards extra props and classes
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "@tanstack/history";
import { createRootRoute, createRoute, createRouter } from "../../src";
import TestLink from "./TestLink.svelte";
import { createLinkTestRouter, getLinkFromTestId } from "../utils";

/** Helper: find anchor by going up from the test id span */
function getLink(): HTMLAnchorElement {
  return getLinkFromTestId(screen);
}

describe("Link component", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
  it("should render an anchor element", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    const link = getLink();
    expect(link).toBeTruthy();
    expect(link.tagName).toBe("A");
  });

  it("should have the correct href", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toBe("/about");
  });

  it("should render children with isActive state", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/",
        linkText: "Home",
      },
    });

    const span = screen.getByTestId("link-text");
    expect(span).toBeTruthy();
    expect(span.textContent).toBe("Home");
  });

  it("should detect active link for current route", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("data-status")).toBe("active");
      expect(link.getAttribute("aria-current")).toBe("page");
    });
  });

  it("should not be active for non-matching route", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    const link = getLink();
    expect(link.getAttribute("data-status")).toBeNull();
    expect(link.getAttribute("aria-current")).toBeNull();
  });

  it("should apply activeProps when active", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        activeProps: { class: "font-bold text-blue" },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.className).toContain("font-bold");
      expect(link.className).toContain("text-blue");
    });
  });

  it("should apply inactiveProps when not active", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        inactiveProps: { class: "text-gray" },
      },
    });

    const link = getLink();
    expect(link.className).toContain("text-gray");
  });

  it("should handle disabled state", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        disabled: true,
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toBeNull();
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
  });

  it("should navigate on click", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    const user = userEvent.setup();
    const link = getLink();
    await user.click(link);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });

  it("should not navigate when disabled", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        disabled: true,
      },
    });

    const user = userEvent.setup();
    const link = getLink();
    await user.click(link);

    // Should still be at root
    expect(router.state.location.pathname).toBe("/");
  });

  it("should not navigate on modified clicks (ctrl/meta)", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
      },
    });

    const user = userEvent.setup();
    const link = getLink();

    // Meta key (cmd+click on Mac) — keyboard modifier + click
    await user.keyboard("{Meta>}");
    await user.click(link);
    await user.keyboard("{/Meta}");
    expect(router.state.location.pathname).toBe("/");
  });

  it("should support target='_blank'", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        target: "_blank",
      },
    });

    const link = getLink();
    expect(link.getAttribute("target")).toBe("_blank");

    // Should not navigate on click with target _blank
    const user = userEvent.setup();
    await user.click(link);
    expect(router.state.location.pathname).toBe("/");
  });

  it("should build href with params", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/posts/$postId",
        params: { postId: "123" },
        linkText: "Post 123",
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toBe("/posts/123");
  });

  it("should build href with search params", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        search: { page: 2 },
        linkText: "About Page 2",
      },
    });

    const link = getLink();
    const href = link.getAttribute("href") ?? "";
    expect(href).toContain("/about");
    expect(href).toContain("page=2");
  });

  it("should build href with hash", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        hash: "section-1",
        linkText: "About Section",
      },
    });

    const link = getLink();
    const href = link.getAttribute("href") ?? "";
    expect(href).toContain("#section-1");
  });

  it("should apply class from inactiveProps when inactive", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        inactiveProps: { class: "inactive" },
      },
    });

    const link = getLink();
    // inactiveProps class is applied when the link is not active
    expect(link.className).toContain("inactive");
  });

  it("should support fuzzy active matching by default", async () => {
    const router = createLinkTestRouter(["/posts/123"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/posts",
        linkText: "Posts",
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("data-status")).toBe("active");
    });
  });

  it("should support exact active matching", async () => {
    const router = createLinkTestRouter(["/posts/123"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/posts",
        linkText: "Posts",
        activeOptions: { exact: true },
      },
    });

    await waitFor(() => {
      const link = getLink();
      // /posts/123 should NOT be an exact match for /posts
      expect(link.getAttribute("data-status")).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Preload behavior
  // -------------------------------------------------------------------------
  it("should preload route on mouse enter (intent)", async () => {
    vi.useFakeTimers();
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const preloadSpy = vi
      .spyOn(router, "preloadRoute")
      .mockResolvedValue(undefined as any);

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        preload: "intent",
        preloadDelay: 100,
      },
    });

    const link = getLink();
    await fireEvent.mouseEnter(link);
    await vi.advanceTimersByTimeAsync(100);

    expect(preloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/about" }),
    );

    preloadSpy.mockRestore();
  });

  it("should cancel preload on mouse leave before delay", async () => {
    vi.useFakeTimers();
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const preloadSpy = vi
      .spyOn(router, "preloadRoute")
      .mockResolvedValue(undefined as any);

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        preload: "intent",
        preloadDelay: 200,
      },
    });

    const link = getLink();
    await fireEvent.mouseEnter(link);
    // Leave before delay fires
    await vi.advanceTimersByTimeAsync(50);
    await fireEvent.mouseLeave(link);
    await vi.advanceTimersByTimeAsync(200);

    expect(preloadSpy).not.toHaveBeenCalled();

    preloadSpy.mockRestore();
  });

  it("should preload route on focus (intent)", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const preloadSpy = vi
      .spyOn(router, "preloadRoute")
      .mockResolvedValue(undefined as any);

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        preload: "intent",
      },
    });

    const link = getLink();
    await fireEvent.focus(link);

    expect(preloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/about" }),
    );

    preloadSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  it("should render an empty anchor when no children provided", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "",
      },
    });

    // Link renders but text is empty
    const link = getLink();
    expect(link.tagName).toBe("A");
  });

  it("should call custom onclick handler alongside navigation", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const onclickSpy = vi.fn();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        onclick: onclickSpy,
      },
    });

    const user = userEvent.setup();
    const link = getLink();
    await user.click(link);

    expect(onclickSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/about");
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility attributes
  // -------------------------------------------------------------------------
  it("should set aria-current='page' on active link", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("aria-current")).toBe("page");
    });
  });

  it("should not set aria-current on inactive link", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    const link = getLink();
    expect(link.getAttribute("aria-current")).toBeNull();
  });

  it("should set aria-disabled and role='link' when disabled", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About", disabled: true },
    });

    const link = getLink();
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("role")).toBe("link");
    expect(link.getAttribute("tabindex")).toBe("-1");
  });

  it("should not set aria-disabled or role when not disabled", async () => {
    const router = createLinkTestRouter();
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    const link = getLink();
    expect(link.getAttribute("aria-disabled")).toBeNull();
    expect(link.getAttribute("role")).toBeNull();
    expect(link.getAttribute("tabindex")).toBeNull();
  });

  // -------------------------------------------------------------------------
  // reloadDocument
  // -------------------------------------------------------------------------
  it("should not prevent default when reloadDocument is true", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        reloadDocument: true,
      },
    });

    const link = getLink();
    // With reloadDocument, the click handler returns early without
    // calling e.preventDefault(), so router.navigate is NOT called.
    // The browser would do a full-page navigation (jsdom emits
    // "Not implemented: navigation to another Document" which is expected).
    const navigateSpy = vi.spyOn(router, "navigate");
    await fireEvent.click(link);

    expect(navigateSpy).not.toHaveBeenCalled();
    navigateSpy.mockRestore();
  });

  it("should still have the correct href with reloadDocument", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        reloadDocument: true,
      },
    });

    const link = getLink();
    expect(link.getAttribute("href")).toBe("/about");
  });

  // -------------------------------------------------------------------------
  // replace
  // -------------------------------------------------------------------------
  it("should pass replace option to router.navigate", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    const navigateSpy = vi.spyOn(router, "navigate");

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        replace: true,
      },
    });

    const user = userEvent.setup();
    await user.click(getLink());

    expect(navigateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ replace: true }),
    );
    navigateSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // state prop
  // -------------------------------------------------------------------------
  it("should pass state to navigation options", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    const navigateSpy = vi.spyOn(router, "navigate");

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        state: { fromPage: "home" },
      },
    });

    const user = userEvent.setup();
    await user.click(getLink());

    expect(navigateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ state: { fromPage: "home" } }),
    );
    navigateSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // Functional activeProps / inactiveProps
  // -------------------------------------------------------------------------
  it("should support functional activeProps", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        activeProps: () => ({ class: "fn-active" }),
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.className).toContain("fn-active");
    });
  });

  it("should support functional inactiveProps", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        inactiveProps: () => ({ class: "fn-inactive" }),
      },
    });

    const link = getLink();
    expect(link.className).toContain("fn-inactive");
  });

  // -------------------------------------------------------------------------
  // Class merging (base + active/inactive)
  // -------------------------------------------------------------------------
  it("should merge base class with activeProps class", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        class: "base-class",
        activeProps: { class: "active-class" },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.className).toContain("base-class");
      expect(link.className).toContain("active-class");
    });
  });

  it("should merge base class with inactiveProps class", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        class: "base-class",
        inactiveProps: { class: "inactive-class" },
      },
    });

    const link = getLink();
    expect(link.className).toContain("base-class");
    expect(link.className).toContain("inactive-class");
  });

  // -------------------------------------------------------------------------
  // Style merging
  // -------------------------------------------------------------------------
  it("should apply base style as a string", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        style: "color: red",
      },
    });

    const link = getLink();
    expect(link.style.color).toBe("red");
  });

  it("should merge base style string with activeProps style", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        style: "color: red",
        activeProps: { style: "font-weight: bold" },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.style.color).toBe("red");
      expect(link.style.fontWeight).toBe("bold");
    });
  });

  // -------------------------------------------------------------------------
  // data-transitioning attribute
  // -------------------------------------------------------------------------
  it("should expose isTransitioning=false in children snippet", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    const span = screen.getByTestId("link-text");
    expect(span.getAttribute("data-transitioning")).toBe("false");
  });

  it("should set data-status=active with isActive snippet arg", async () => {
    const router = createLinkTestRouter(["/about"]);
    await router.load();

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    await waitFor(() => {
      const span = screen.getByTestId("link-text");
      expect(span.getAttribute("data-active")).toBe("true");
    });
  });

  // -------------------------------------------------------------------------
  // activeOptions.includeSearch
  // -------------------------------------------------------------------------
  it("should be active with includeSearch when search matches", async () => {
    const router = createLinkTestRouter(["/about?tab=info"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        search: { tab: "info" },
        linkText: "About Info",
        activeOptions: { includeSearch: true },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("data-status")).toBe("active");
    });
  });

  it("should not be active with includeSearch when search differs", async () => {
    const router = createLinkTestRouter(["/about?tab=info"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        search: { tab: "other" },
        linkText: "About Other",
        activeOptions: { includeSearch: true },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("data-status")).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // activeOptions.includeHash
  // -------------------------------------------------------------------------
  it("should be active with includeHash when hash matches", async () => {
    const router = createLinkTestRouter(["/about#section"]);
    await router.load();

    render(TestLink, {
      props: {
        router,
        to: "/about",
        hash: "section",
        linkText: "About Section",
        activeOptions: { includeHash: true },
      },
    });

    await waitFor(() => {
      const link = getLink();
      expect(link.getAttribute("data-status")).toBe("active");
    });
  });

  // -------------------------------------------------------------------------
  // touchstart preload
  // -------------------------------------------------------------------------
  it("should preload on touchstart (intent)", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const preloadSpy = vi
      .spyOn(router, "preloadRoute")
      .mockResolvedValue(undefined as any);

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        preload: "intent",
      },
    });

    const link = getLink();
    await fireEvent.touchStart(link);

    expect(preloadSpy).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/about" }),
    );

    preloadSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // defaultPreload / defaultPreloadDelay from router options
  // -------------------------------------------------------------------------
  it("should use router defaultPreload when preload prop not set", async () => {
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
      defaultPreload: "intent",
      defaultPreloadDelay: 0,
    });
    await router.load();

    const preloadSpy = vi
      .spyOn(router, "preloadRoute")
      .mockResolvedValue(undefined as any);

    render(TestLink, {
      props: { router, to: "/about", linkText: "About" },
    });

    const link = getLink();
    await fireEvent.focus(link);

    expect(preloadSpy).toHaveBeenCalled();
    preloadSpy.mockRestore();
  });

  // -------------------------------------------------------------------------
  // resetScroll / viewTransition passed to navigate
  // -------------------------------------------------------------------------
  it("should pass resetScroll and viewTransition to navigate", async () => {
    const router = createLinkTestRouter(["/"]);
    await router.load();
    const navigateSpy = vi.spyOn(router, "navigate");

    render(TestLink, {
      props: {
        router,
        to: "/about",
        linkText: "About",
        resetScroll: false,
        viewTransition: true,
      },
    });

    const user = userEvent.setup();
    await user.click(getLink());

    expect(navigateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        resetScroll: false,
        viewTransition: true,
      }),
    );
    navigateSpy.mockRestore();
  });
});
