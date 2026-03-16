/**
 * linkOptions utility tests.
 *
 * Tests that `linkOptions` is an identity function that returns its input,
 * used for type-safe link prop construction.
 */
import { describe, expect, it } from "vitest";
import { linkOptions } from "../src/link";

describe("linkOptions", () => {
  it("should return the same object passed in", () => {
    const input = { to: "/about" } as any;
    const result = linkOptions(input);
    expect(result).toBe(input);
  });

  it("should preserve all properties", () => {
    const input = {
      to: "/posts/$postId",
      params: { postId: "123" },
      search: { tab: "details" },
      hash: "section-1",
    } as any;

    const result = linkOptions(input);

    expect(result.to).toBe("/posts/$postId");
    expect(result.params).toEqual({ postId: "123" });
    expect(result.search).toEqual({ tab: "details" });
    expect(result.hash).toBe("section-1");
  });

  it("should pass through extra properties", () => {
    const input = {
      to: "/about",
      class: "my-link",
      "data-custom": "value",
    } as any;

    const result = linkOptions(input);
    expect(result.class).toBe("my-link");
    expect(result["data-custom"]).toBe("value");
  });

  it("should handle mask options", () => {
    const input = {
      to: "/internal",
      mask: {
        to: "/public",
        unmaskOnReload: true,
      },
    } as any;

    const result = linkOptions(input);
    expect(result.mask?.to).toBe("/public");
    expect(result.mask?.unmaskOnReload).toBe(true);
  });
});
