/**
 * SSR server-side rendering utilities for @tanstack/svelte-router.
 *
 * This is the single source of truth for rendering a TanStack Router + Svelte
 * application to HTML on the server. It mirrors the official React/Solid/Vue
 * adapters' `ssr/server` modules:
 *
 *   - `renderRouterToString`  — render to a complete HTML string Response
 *   - `renderRouterToStream`  — render to a streamed HTML Response
 *   - `defaultRenderHandler`  — `defineHandlerCallback` wrapper (string)
 *   - `defaultStreamHandler`  — `defineHandlerCallback` wrapper (stream)
 *   - `RouterServer`          — the Svelte root component rendered during SSR
 *
 * Svelte specifics (vs React/Solid):
 *   - `svelte/server`'s `render()` is **synchronous** and returns `head` on a
 *     separate channel, so the surrounding document is assembled here rather
 *     than emitted by the component tree. As a consequence, true streaming /
 *     deferred SSR (React Suspense-style) is not available; both handlers
 *     render the full document up-front. The router's dehydration scripts are
 *     captured synchronously via the `serverSsr` lifecycle below, so the
 *     "stream" variant simply emits the same fully-assembled document.
 */
import { render } from "svelte/server";
import { defineHandlerCallback } from "@tanstack/router-core/ssr/server";
import RouterServerComponent from "../components/RouterServer.svelte";
export { default as RouterServer } from "../components/RouterServer.svelte";
// ============================================================================
// Public renderers
// ============================================================================
/**
 * Render the router application to a complete HTML string Response.
 * Used for non-streaming SSR and static generation.
 */
export function renderRouterToString({ router, responseHeaders, App = RouterServerComponent, }) {
    const fullHtml = renderDocument(router, App);
    const headers = new Headers(responseHeaders);
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(fullHtml, {
        status: getStatusCode(router),
        headers,
    });
}
/**
 * Render the router application to a streamed HTML Response.
 *
 * Svelte 5's `render()` is synchronous, so the document is produced up-front
 * and enqueued into a single-chunk `ReadableStream`. Because the router's
 * dehydration scripts are already captured during {@link renderDocument},
 * the streamed bytes are byte-for-byte identical to {@link renderRouterToString}.
 */
export function renderRouterToStream({ router, responseHeaders, App = RouterServerComponent, }) {
    const fullHtml = renderDocument(router, App);
    const encoder = new TextEncoder();
    const appStream = new ReadableStream({
        start(controller) {
            controller.enqueue(encoder.encode(fullHtml));
            controller.close();
        },
    });
    const headers = new Headers(responseHeaders);
    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/html; charset=utf-8");
    }
    return new Response(appStream, {
        status: getStatusCode(router),
        headers,
    });
}
// ============================================================================
// Handler callbacks (consumed by @tanstack/svelte-start)
// ============================================================================
/**
 * Default handler that renders the app as a complete HTML string.
 * Pass to `createStartHandler(defaultRenderHandler)`.
 */
export const defaultRenderHandler = defineHandlerCallback(({ router, responseHeaders }) => renderRouterToString({ router, responseHeaders }));
/**
 * Default handler that renders the app as a streamed HTML response.
 * Pass to `createStartHandler(defaultStreamHandler)`.
 */
export const defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({ request, router, responseHeaders }));
// ============================================================================
// Internal document assembly
// ============================================================================
function getStatusCode(router) {
    return router.state.statusCode ?? 200;
}
/**
 * Render the App component and assemble the full HTML document, including the
 * route-managed `<head>` content, Vite manifest assets, and the router's
 * dehydration scripts (`$_TSR`).
 */
function renderDocument(router, App) {
    const { body, head } = render(App, { props: { router } });
    return wrapHtmlDocument({ html: body, head, router });
}
function escapeAttr(value) {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
/** Render a single RouterManagedTag to an HTML string. */
function renderTag(tag) {
    const attrs = tag.attrs
        ? Object.entries(tag.attrs)
            .filter(([, v]) => v != null && v !== false)
            .map(([k, v]) => v === true ? ` ${k}` : ` ${k}="${escapeAttr(String(v))}"`)
            .join("")
        : "";
    if (!tag.children && (tag.tag === "meta" || tag.tag === "link")) {
        return `<${tag.tag}${attrs} />`;
    }
    return `<${tag.tag}${attrs}>${tag.children ?? ""}</${tag.tag}>`;
}
/**
 * Collect manifest asset tags (client entry script, CSS, modulepreloads)
 * from the router's SSR manifest for every matched route.
 */
function collectAssetTags(router) {
    const manifest = router.ssr?.manifest;
    if (!manifest?.routes)
        return "";
    const seen = new Set();
    const tags = [];
    for (const match of router.state.matches) {
        const routeManifest = manifest.routes[match.routeId];
        if (!routeManifest?.assets)
            continue;
        for (const asset of routeManifest.assets) {
            const rendered = renderTag(asset);
            if (!seen.has(rendered)) {
                seen.add(rendered);
                tags.push(rendered);
            }
        }
    }
    return tags.join("\n    ");
}
/**
 * Get the router's dehydration scripts (the `$_TSR` bootstrap + serialized
 * router state). The Start handler calls `router.serverSsr.dehydrate()` before
 * rendering, so the buffer is ready once rendering finishes.
 */
function getDehydrationScripts(router) {
    const serverSsr = router.serverSsr;
    if (!serverSsr)
        return "";
    // Signal that rendering is complete (synchronous for Svelte).
    serverSsr.setRenderFinished?.();
    const scriptTag = serverSsr.takeBufferedScripts?.();
    const scriptHtml = scriptTag ? renderTag(scriptTag) : "";
    const injectedHtml = serverSsr.takeBufferedHtml?.() ?? "";
    serverSsr.cleanup?.();
    return scriptHtml + injectedHtml;
}
/**
 * Wrap rendered body HTML in a complete document. The app is mounted into
 * `<div id="__app">` so the client can hydrate that subtree.
 */
function wrapHtmlDocument({ html, head, router, }) {
    const assetTags = collectAssetTags(router);
    const dehydrationScripts = getDehydrationScripts(router);
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${head}
    ${assetTags}
  </head>
  <body>
    <div id="__app">${html}</div>
    ${dehydrationScripts}
  </body>
</html>`;
}
export { render as svelteRender } from "svelte/server";
