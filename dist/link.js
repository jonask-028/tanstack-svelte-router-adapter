/**
 * Link utilities for TanStack Svelte Router.
 *
 * Provides `linkOptions` — a type-safe helper for building link prop objects
 * that can be spread onto `<Link>` components or passed to `navigate`/`redirect`.
 *
 * @module
 */
// ============================================================================
// linkOptions
// ============================================================================
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
export function linkOptions(options) {
    return options;
}
