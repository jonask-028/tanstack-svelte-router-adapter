import type { RouterManagedTag } from "@tanstack/router-core";
/**
 * Build the complete list of head tags (title, meta, links, styles, head
 * scripts) for the current route matches. Used internally by `HeadContent`.
 *
 * Handles:
 * - `title` deduplication (last match wins)
 * - `meta` deduplication by `name`/`property` (last match wins)
 * - JSON-LD `script:ld+json` structured data
 * - `link` tags from route `links` + Vite manifest assets
 * - Module preload links from SSR manifest
 * - `style` tags from route `styles`
 * - Head `script` tags from route `headScripts`
 * - CSP nonce support
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useTags } from '@tanstack/svelte-router'
 *   let tags = $derived(useTags())
 * </script>
 * ```
 */
export declare function useTags(): Array<RouterManagedTag>;
//# sourceMappingURL=useTags.d.ts.map