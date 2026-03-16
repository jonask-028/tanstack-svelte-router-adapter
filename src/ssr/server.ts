/**
 * SSR server-side rendering utilities for @tanstack/svelte-router.
 *
 * These functions render the Svelte router application to HTML strings or
 * readable streams for server-side rendering.
 */
import { render } from "svelte/server";
import type { AnyRouter } from "@tanstack/router-core";
import type { Component } from "svelte";

export interface RenderRouterToStringOptions {
  router: AnyRouter;
  responseHeaders: Headers;
  App: Component<{ router: AnyRouter }>;
}

export interface RenderRouterToStreamOptions {
  request: Request;
  router: AnyRouter;
  responseHeaders: Headers;
  App: Component<{ router: AnyRouter }>;
}

/**
 * Render the router application to a string.
 * Used for non-streaming SSR.
 */
export async function renderRouterToString({
  router,
  responseHeaders,
  App,
}: RenderRouterToStringOptions): Promise<Response> {
  const { body, head } = render(App, {
    props: { router },
  });

  const fullHtml = `<!DOCTYPE html>${body}`;

  return new Response(fullHtml, {
    status: (router.state as any).statusCode ?? 200,
    headers: responseHeaders,
  });
}

/**
 * Render the router application to a readable stream.
 * Uses Svelte's synchronous render but wraps in a stream for consistency.
 *
 * Note: Svelte 5's render() is synchronous, unlike React's renderToReadableStream.
 * Streaming is achieved at the data level via router's transformReadableStreamWithRouter.
 */
export async function renderRouterToStream({
  request,
  router,
  responseHeaders,
  App,
}: RenderRouterToStreamOptions): Promise<Response> {
  // Svelte 5's server render is synchronous, so we render to string
  // and wrap it in a stream for the router's stream transformation
  const { body, head } = render(App, {
    props: { router },
  });

  const fullHtml = `<!DOCTYPE html>${body}`;

  // Create a readable stream from the HTML string
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(fullHtml));
      controller.close();
    },
  });

  return new Response(readable, {
    status: (router.state as any).statusCode ?? 200,
    headers: responseHeaders,
  });
}

export { render as svelteRender } from "svelte/server";
