import { escapeHtml } from "@tanstack/router-core";
import { useRouter } from "./useRouter.js";
import { useRouterState } from "./useRouterState.js";
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
export function useTags() {
    const router = useRouter();
    const nonce = router.options.ssr?.nonce;
    // --- Meta tags (title, meta, JSON-LD) ---
    const routeMeta = useRouterState({
        select: (state) => state.matches.map((match) => match.meta).filter(Boolean),
    });
    const meta = (() => {
        const resultMeta = [];
        const metaByAttribute = {};
        let title;
        // Walk matches in reverse so last match wins on conflicts
        for (let i = routeMeta.length - 1; i >= 0; i--) {
            const metas = routeMeta[i];
            for (let j = metas.length - 1; j >= 0; j--) {
                const m = metas[j];
                if (!m)
                    continue;
                if (m.title) {
                    if (!title) {
                        title = { tag: "title", children: m.title };
                    }
                }
                else if ("script:ld+json" in m) {
                    try {
                        const json = JSON.stringify(m["script:ld+json"]);
                        resultMeta.push({
                            tag: "script",
                            attrs: { type: "application/ld+json" },
                            children: escapeHtml(json),
                        });
                    }
                    catch {
                        // Skip invalid JSON-LD
                    }
                }
                else {
                    const attribute = m.name ?? m.property;
                    if (attribute) {
                        if (metaByAttribute[attribute])
                            continue;
                        metaByAttribute[attribute] = true;
                    }
                    resultMeta.push({ tag: "meta", attrs: { ...m, nonce } });
                }
            }
        }
        if (title)
            resultMeta.push(title);
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
        select: (state) => {
            const constructed = state.matches
                .map((match) => match.links)
                .filter(Boolean)
                .flat(1)
                .map((link) => ({
                tag: "link",
                attrs: { ...link, nonce },
            }));
            const manifest = router.ssr?.manifest;
            const assets = state.matches
                .map((match) => manifest?.routes?.[match.routeId]?.assets ?? [])
                .filter(Boolean)
                .flat(1)
                .filter((asset) => asset.tag === "link")
                .map((asset) => ({
                tag: "link",
                attrs: { ...asset.attrs, nonce },
            }));
            return [...constructed, ...assets];
        },
    });
    // --- Preload links ---
    const preloadLinks = useRouterState({
        select: (state) => {
            const preloads = [];
            const manifest = router.ssr?.manifest;
            if (!manifest)
                return preloads;
            state.matches
                .map((match) => router.looseRoutesById[match.routeId])
                .forEach((route) => manifest.routes?.[route.id]?.preloads
                ?.filter(Boolean)
                .forEach((preload) => {
                preloads.push({
                    tag: "link",
                    attrs: { rel: "modulepreload", href: preload, nonce },
                });
            }));
            return preloads;
        },
    });
    // --- Style tags ---
    const styles = useRouterState({
        select: (state) => state.matches
            .map((match) => match.styles)
            .flat(1)
            .filter(Boolean).map(({ children, ...attrs }) => ({
            tag: "style",
            attrs: { ...attrs, nonce },
            children,
        })),
    });
    // --- Head script tags ---
    const headScripts = useRouterState({
        select: (state) => state.matches
            .map((match) => match.headScripts)
            .flat(1)
            .filter(Boolean).map(({ children, ...script }) => ({
            tag: "script",
            attrs: { ...script, nonce },
            children,
        })),
    });
    // --- Deduplicate & return ---
    return uniqBy([...meta, ...preloadLinks, ...links, ...styles, ...headScripts], (d) => JSON.stringify(d));
}
/** Deduplicate an array by a key function. */
function uniqBy(arr, fn) {
    const seen = new Set();
    return arr.filter((item) => {
        const key = fn(item);
        if (seen.has(key))
            return false;
        seen.add(key);
        return true;
    });
}
