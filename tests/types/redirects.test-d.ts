/**
 * Type-level tests for redirect types.
 *
 * Mirrors React/Vue adapter's redirects.test-d.tsx.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  Redirect,
  ResolvedRedirect,
  AnyRedirect,
  RedirectOptions,
} from "../../src";

describe("Redirect types", () => {
  it("Redirect should be a valid type", () => {
    expectTypeOf<Redirect>().toBeObject();
  });

  it("ResolvedRedirect should be a valid type", () => {
    expectTypeOf<ResolvedRedirect>().toBeObject();
  });

  it("AnyRedirect should be a valid type", () => {
    expectTypeOf<AnyRedirect>().toBeObject();
  });

  it("RedirectOptions should be a valid type", () => {
    expectTypeOf<RedirectOptions>().toBeObject();
  });
});
