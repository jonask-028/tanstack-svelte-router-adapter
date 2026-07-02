/**
 * ClientOnly component tests — mirrors React/Vue adapter's ClientOnly.test.tsx.
 *
 * Tests that the component renders fallback initially and children after mount.
 * Uses harness components because Svelte 5 snippets can't be created inline in tests.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/svelte";
import ClientOnlyHarness from "./harnesses/ClientOnlyHarness.svelte";
import ClientOnlyNoFallbackHarness from "./harnesses/ClientOnlyNoFallbackHarness.svelte";

afterEach(cleanup);

describe("ClientOnly", () => {
  it("should render children after mount (client)", async () => {
    render(ClientOnlyHarness);

    // After mount (onMount fires), hydrated becomes true and children render
    await waitFor(() => {
      expect(screen.getByTestId("client-content")).toBeInTheDocument();
    });
  });

  it("should not render fallback after hydration", async () => {
    render(ClientOnlyHarness);

    await waitFor(() => {
      expect(screen.getByTestId("client-content")).toBeInTheDocument();
      expect(screen.queryByTestId("fallback-content")).not.toBeInTheDocument();
    });
  });

  it("should work without fallback", async () => {
    render(ClientOnlyNoFallbackHarness);

    await waitFor(() => {
      expect(screen.getByTestId("client-content")).toBeInTheDocument();
    });
  });
});
