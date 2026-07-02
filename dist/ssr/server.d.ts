import type { AnyRouter } from "@tanstack/router-core";
import type { Component } from "svelte";
export { default as RouterServer } from "../components/RouterServer.svelte";
/**
 * A component that accepts a `router` prop and renders the matched route tree.
 * Defaults to {@link RouterServer}, but Start adapters pass their own
 * `StartServer` so the SSR and hydration trees stay aligned.
 */
export type AppComponent = Component<{
    router: AnyRouter;
}>;
export interface RenderRouterToStringOptions {
    router: AnyRouter;
    responseHeaders: Headers;
    App?: AppComponent;
}
export interface RenderRouterToStreamOptions {
    request: Request;
    router: AnyRouter;
    responseHeaders: Headers;
    App?: AppComponent;
}
/**
 * Render the router application to a complete HTML string Response.
 * Used for non-streaming SSR and static generation.
 */
export declare function renderRouterToString({ router, responseHeaders, App, }: RenderRouterToStringOptions): Response;
/**
 * Render the router application to a streamed HTML Response.
 *
 * Svelte 5's `render()` is synchronous, so the document is produced up-front
 * and enqueued into a single-chunk `ReadableStream`. Because the router's
 * dehydration scripts are already captured during {@link renderDocument},
 * the streamed bytes are byte-for-byte identical to {@link renderRouterToString}.
 */
export declare function renderRouterToStream({ router, responseHeaders, App, }: RenderRouterToStreamOptions): Response;
/**
 * Default handler that renders the app as a complete HTML string.
 * Pass to `createStartHandler(defaultRenderHandler)`.
 */
export declare const defaultRenderHandler: import("@tanstack/router-core/ssr/server").HandlerCallback<AnyRouter>;
/**
 * Default handler that renders the app as a streamed HTML response.
 * Pass to `createStartHandler(defaultStreamHandler)`.
 */
export declare const defaultStreamHandler: import("@tanstack/router-core/ssr/server").HandlerCallback<AnyRouter>;
export { render as svelteRender } from "svelte/server";
//# sourceMappingURL=server.d.ts.map