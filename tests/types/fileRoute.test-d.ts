/**
 * Type-level tests for file route types.
 *
 * Mirrors React/Vue adapter's fileRoute.test-d.tsx.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  FileRoutesByPath,
  FileRouteTypes,
  LazyRouteOptions,
  CreateFileRouteType,
  CreateLazyFileRouteType,
} from "../../src";

describe("File route types", () => {
  it("FileRoutesByPath should be a valid type", () => {
    expectTypeOf<FileRoutesByPath>().toBeObject();
  });

  it("FileRouteTypes should be a valid type", () => {
    expectTypeOf<FileRouteTypes>().toBeObject();
  });

  it("LazyRouteOptions should be a valid type", () => {
    expectTypeOf<LazyRouteOptions>().toBeObject();
  });

  it("CreateFileRouteType should be callable", () => {
    expectTypeOf<CreateFileRouteType<any, any, any, any, any>>().toBeFunction();
  });

  it("CreateLazyFileRouteType should be callable", () => {
    expectTypeOf<CreateLazyFileRouteType<any>>().toBeFunction();
  });
});
