/**
 * Type-level tests for route types.
 *
 * Mirrors React/Vue adapter's route.test-d.tsx.
 * Verifies compile-time route type safety.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  AnyRoute,
  RouteOptions,
  RouteMatch,
  AnyRouteMatch,
  RouteIds,
  RoutePaths,
  RouteById,
  RouteByPath,
  MetaDescriptor,
  RouteLinkEntry,
  RouteLoaderFn,
  StaticDataRouteOption,
} from "../../src";

describe("Route types", () => {
  it("AnyRoute should be a valid type", () => {
    expectTypeOf<AnyRoute>().toBeObject();
  });

  it("RouteOptions should be a valid type", () => {
    expectTypeOf<RouteOptions<any>>().toBeObject();
  });

  it("RouteMatch should be a valid type", () => {
    expectTypeOf<RouteMatch<any, any, any, any, any, any, any>>().toBeObject();
  });

  it("AnyRouteMatch should be a valid type", () => {
    expectTypeOf<AnyRouteMatch>().toBeObject();
  });

  it("MetaDescriptor should be a valid type", () => {
    expectTypeOf<MetaDescriptor>().toBeObject();
  });
});
