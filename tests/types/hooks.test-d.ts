/**
 * Type-level tests for hook types.
 *
 * Mirrors React/Vue adapter's useMatch.test-d.tsx, useParams.test-d.tsx,
 * useSearch.test-d.tsx, useLocation.test-d.tsx, useBlocker.test-d.tsx, etc.
 */
import { describe, it, expectTypeOf } from "vitest";
import type {
  UseNavigateResult,
  UseBlockerOpts,
  BlockerResolver,
  ShouldBlockFn,
  StrictOrFrom,
  ParsedLocation,
  MatchRouteOptions,
  ErrorComponentProps,
  NotFoundRouteProps,
  UseSearchResult,
  UseParamsResult,
  UseLoaderDataResult,
  UseLoaderDepsResult,
} from "../../src";

describe("Hook result types", () => {
  it("UseNavigateResult should be callable", () => {
    expectTypeOf<UseNavigateResult<string>>().toBeFunction();
  });

  it("ParsedLocation should have pathname", () => {
    expectTypeOf<ParsedLocation>().toHaveProperty("pathname");
  });

  it("ParsedLocation should have search", () => {
    expectTypeOf<ParsedLocation>().toHaveProperty("search");
  });

  it("ParsedLocation should have hash", () => {
    expectTypeOf<ParsedLocation>().toHaveProperty("hash");
  });

  it("ParsedLocation should have href", () => {
    expectTypeOf<ParsedLocation>().toHaveProperty("href");
  });
});

describe("Blocker types", () => {
  it("UseBlockerOpts should be a valid type", () => {
    expectTypeOf<UseBlockerOpts>().toBeObject();
  });

  it("BlockerResolver should have status property", () => {
    expectTypeOf<BlockerResolver>().toHaveProperty("status");
  });

  it("BlockerResolver should have proceed method", () => {
    expectTypeOf<BlockerResolver>().toHaveProperty("proceed");
  });

  it("BlockerResolver should have reset method", () => {
    expectTypeOf<BlockerResolver>().toHaveProperty("reset");
  });

  it("ShouldBlockFn should be callable", () => {
    expectTypeOf<ShouldBlockFn>().toBeFunction();
  });
});

describe("Error/NotFound component types", () => {
  it("ErrorComponentProps should be a valid type", () => {
    expectTypeOf<ErrorComponentProps>().toBeObject();
  });

  it("ErrorComponentProps should have error property", () => {
    expectTypeOf<ErrorComponentProps>().toHaveProperty("error");
  });

  it("NotFoundRouteProps should be a valid type", () => {
    expectTypeOf<NotFoundRouteProps>().toBeObject();
  });
});

describe("Match route types", () => {
  it("MatchRouteOptions should be a valid type", () => {
    expectTypeOf<MatchRouteOptions>().toBeObject();
  });

  it("MatchRouteOptions should have 'fuzzy' property", () => {
    expectTypeOf<MatchRouteOptions>().toHaveProperty("fuzzy");
  });
});
