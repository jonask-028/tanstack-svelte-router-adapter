/**
 * Type-level tests for Link and navigation types.
 *
 * Mirrors React/Vue adapter's link.test-d.tsx and useNavigate.test-d.tsx.
 * These tests verify compile-time type safety.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  LinkOptions,
  ActiveOptions,
  NavigateOptions,
  ToOptions,
  UseNavigateResult,
} from "../../src";

describe("Link types", () => {
  it("LinkOptions should have 'to' property", () => {
    expectTypeOf<LinkOptions>().toHaveProperty("to");
  });

  it("LinkOptions should have 'from' property", () => {
    expectTypeOf<LinkOptions>().toHaveProperty("from");
  });

  it("LinkOptions should have 'search' property", () => {
    expectTypeOf<LinkOptions>().toHaveProperty("search");
  });

  it("LinkOptions should have 'hash' property", () => {
    expectTypeOf<LinkOptions>().toHaveProperty("hash");
  });

  it("LinkOptions should have 'activeOptions' property", () => {
    expectTypeOf<LinkOptions>().toHaveProperty("activeOptions");
  });

  it("ActiveOptions should have 'exact' property", () => {
    expectTypeOf<ActiveOptions>().toHaveProperty("exact");
  });

  it("ActiveOptions should have 'includeSearch' property", () => {
    expectTypeOf<ActiveOptions>().toHaveProperty("includeSearch");
  });

  it("ActiveOptions should have 'includeHash' property", () => {
    expectTypeOf<ActiveOptions>().toHaveProperty("includeHash");
  });
});

describe("Navigation types", () => {
  it("NavigateOptions should have 'to' property", () => {
    expectTypeOf<NavigateOptions>().toHaveProperty("to");
  });

  it("NavigateOptions should have 'replace' property", () => {
    expectTypeOf<NavigateOptions>().toHaveProperty("replace");
  });

  it("ToOptions should have 'to' property", () => {
    expectTypeOf<ToOptions>().toHaveProperty("to");
  });
});
