/**
 * Type-level tests for router types.
 *
 * Mirrors React/Vue adapter's router.test-d.tsx.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  AnyRouter,
  RegisteredRouter,
  RouterOptions,
  RouterState,
  RouterEvents,
  TrailingSlashOption,
} from "../../src";

describe("Router types", () => {
  it("AnyRouter should be a valid type", () => {
    expectTypeOf<AnyRouter>().toBeObject();
  });

  it("RegisteredRouter should be a valid type", () => {
    expectTypeOf<RegisteredRouter>().toBeObject();
  });

  it("RouterOptions should be a valid type", () => {
    expectTypeOf<RouterOptions<any, any>>().toBeObject();
  });

  it("RouterState should be a valid type", () => {
    expectTypeOf<RouterState>().toBeObject();
  });

  it("RouterEvents should be a valid type", () => {
    expectTypeOf<RouterEvents>().toBeObject();
  });

  it("TrailingSlashOption should be a string union", () => {
    expectTypeOf<TrailingSlashOption>().toBeString();
  });
});
