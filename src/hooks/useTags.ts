import { escapeHtml } from "@tanstack/router-core";
import { useRouter } from "./useRouter.js";
import { useRouterState } from "./useRouterState.js";
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
export function useTags(): Array<RouterManagedTag> {
  const router = useRouter();
  const nonce = (router.options as any).ssr?.nonce as string | undefined;

  // --- Meta tags (title, meta, JSON-LD) ---
  const routeMeta = useRouterState({
    select: (state: any) =>
      state.matches.map((match: any) => match.meta!).filter(Boolean),
  }) as Array<Array<any>>;

  const meta: Array<RouterManagedTag> = (() => {
    const resultMeta: Array<RouterManagedTag> = [];
    const metaByAttribute: Record<string, true> = {};
    let title: RouterManagedTag | undefined;

    // Walk matches in reverse so last match wins on conflicts
    for (let i = routeMeta.length - 1; i >= 0; i--) {
      const metas = routeMeta[i]!;
      for (let j = metas.length - 1; j >= 0; j--) {
        const m = metas[j];
        if (!m) continue;

        if (m.title) {
          if (!title) {
            title = { tag: "title", children: m.title };
          }
        } else if ("script:ld+json" in m) {
          try {
            const json = JSON.stringify(m["script:ld+json"]);
            resultMeta.push({
              tag: "script",
              attrs: { type: "application/ld+json" },
              children: escapeHtml(json),
            });
          } catch {
            // Skip invalid JSON-LD
          }
        } else {
          const attribute = m.name ?? m.property;
          if (attribute) {
            if (metaByAttribute[attribute]) continue;
            metaByAttribute[attribute] = true;
          }
          resultMeta.push({ tag: "meta", attrs: { ...m, nonce } });
        }
      }
    }

    if (title) resultMeta.push(title);

    if (nonce) {
      resultMeta.push({
        tag: "meta",
        attrs: { property: "csp-nonce", content: nonce },
      });
    }

    resultMeta.reverse();
    return resultMeta;
  })();

  // --- Link tags ---
  const links = useRouterState({
    select: (state: any) => {
      const constructed = state.matches
        .map((match: any) => match.links!)
        .filter(Boolean)
        .flat(1)
        .map((link: any) => ({
          tag: "link" as const,
          attrs: { ...link, nonce },
        })) satisfies Array<RouterManagedTag>;

      const manifest = (router as any).ssr?.manifest;
      const assets = state.matches
        .map((match: any) => manifest?.routes?.[match.routeId]?.assets ?? [])
        .filter(Boolean)
        .flat(1)
        .filter((asset: any) => asset.tag === "link")
        .map(
          (asset: any) =>
            ({
              tag: "link" as const,
              attrs: { ...asset.attrs, nonce },
            }) satisfies RouterManagedTag,
        );

      return [...constructed, ...assets] as Array<RouterManagedTag>;
    },
  }) as Array<RouterManagedTag>;

  // --- Preload links ---
  const preloadLinks = useRouterState({
    select: (state: any) => {
      const preloads: Array<RouterManagedTag> = [];
      const manifest = (router as any).ssr?.manifest;
      if (!manifest) return preloads;

      state.matches
        .map((match: any) => (router as any).looseRoutesById[match.routeId]!)
        .forEach((route: any) =>
          manifest.routes?.[route.id]?.preloads
            ?.filter(Boolean)
            .forEach((preload: string) => {
              preloads.push({
                tag: "link",
                attrs: { rel: "modulepreload", href: preload, nonce },
              });
            }),
        );

      return preloads;
    },
  }) as Array<RouterManagedTag>;

  // --- Style tags ---
  const styles = useRouterState({
    select: (state: any) =>
      (
        state.matches
          .map((match: any) => match.styles!)
          .flat(1)
          .filter(Boolean) as Array<any>
      ).map(({ children, ...attrs }: any) => ({
        tag: "style" as const,
        attrs: { ...attrs, nonce },
        children,
      })) satisfies Array<RouterManagedTag>,
  }) as Array<RouterManagedTag>;

  // --- Head script tags ---
  const headScripts = useRouterState({
    select: (state: any) =>
      (
        state.matches
          .map((match: any) => match.headScripts!)
          .flat(1)
          .filter(Boolean) as Array<any>
      ).map(({ children, ...script }: any) => ({
        tag: "script" as const,
        attrs: { ...script, nonce },
        children,
      })) satisfies Array<RouterManagedTag>,
  }) as Array<RouterManagedTag>;

  // --- Deduplicate & return ---
  return uniqBy(
    [...meta, ...preloadLinks, ...links, ...styles, ...headScripts],
    (d) => JSON.stringify(d),
  );
}

/** Deduplicate an array by a key function. */
function uniqBy<T>(arr: Array<T>, fn: (item: T) => string): Array<T> {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
