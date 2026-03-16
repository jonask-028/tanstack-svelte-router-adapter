import type { AnyRouter } from "@tanstack/router-core";
import type { Component } from "svelte";
export interface RenderRouterToStringOptions {
    router: AnyRouter;
    responseHeaders: Headers;
    App: Component<{
        router: AnyRouter;
    }>;
}
export interface RenderRouterToStreamOptions {
    request: Request;
    router: AnyRouter;
    responseHeaders: Headers;
    App: Component<{
        router: AnyRouter;
    }>;
}
/**
 * Render the router application to a string.
 * Used for non-streaming SSR.
 */
export declare function renderRouterToString({ router, responseHeaders, App, }: RenderRouterToStringOptions): Promise<Response>;
/**
 * Render the router application to a readable stream.
 * Uses Svelte's synchronous render but wraps in a stream for consistency.
 *
 * Note: Svelte 5's render() is synchronous, unlike React's renderToReadableStream.
 * Streaming is achieved at the data level via router's transformReadableStreamWithRouter.
 */
export declare function renderRouterToStream({ request, router, responseHeaders, App, }: RenderRouterToStreamOptions): Promise<Response>;
export { render as svelteRender } from "svelte/server";
//# sourceMappingURL=server.d.ts.map