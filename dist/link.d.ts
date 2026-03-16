/**
 * Link utilities for TanStack Svelte Router.
 *
 * Provides `linkOptions` — a type-safe helper for building link prop objects
 * that can be spread onto `<Link>` components or passed to `navigate`/`redirect`.
 *
 * @module
 */
import type { AnyRouter, LinkOptions, RegisteredRouter } from "@tanstack/router-core";
/**
 * Type-check a link options object literal.
 *
 * Returns the exact same object with inferred types. Use this to pre-build
 * type-safe link props that can be spread onto `<Link>`.
 *
 * @example
 * ```ts
 * import { linkOptions, Link } from '@tanstack/svelte-router'
 *
 * const opts = linkOptions({
 *   to: '/posts/$postId',
 *   params: { postId: '123' },
 * })
 *
 * // In a component:
 * <Link {...opts}>Post 123</Link>
 * ```
 */
export declare function linkOptions<TRouter extends AnyRouter = RegisteredRouter, const TFrom extends string = string, const TTo extends string = "", const TMaskFrom extends string = TFrom, const TMaskTo extends string = "">(options: LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & Record<string, unknown>): LinkOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> & Record<string, unknown>;
//# sourceMappingURL=link.d.ts.map