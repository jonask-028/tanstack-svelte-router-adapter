<!--
  RouterServer — Server-side root component.

  Renders the RouterProvider for the matched route tree during SSR. This is the
  Svelte equivalent of the official adapters' `RouterServer` (React/Solid/Vue).
  The surrounding HTML document (doctype, <head>, <body>, dehydration scripts)
  is assembled by `renderRouterToString` / `renderRouterToStream` in
  `ssr/server.ts`, because Svelte's `render()` returns `head` on a separate
  channel and renders synchronously.

  Keeping the rendered tree structurally identical to the client root component
  is what allows Svelte's `hydrate()` to match the server-rendered DOM.
-->
<script lang="ts">
  import RouterProvider from "./RouterProvider.svelte";
  import type { AnyRouter } from "@tanstack/router-core";

  let { router }: { router: AnyRouter } = $props();
</script>

<RouterProvider {router} />
