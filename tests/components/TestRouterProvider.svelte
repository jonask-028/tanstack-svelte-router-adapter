<!--
  Test wrapper — Renders RouterProvider and a slot for children.
  Used by component tests to mount components within router context.
-->
<script lang="ts">
  import type { AnyRouter } from "@tanstack/router-core";
  import RouterProvider from "../../src/components/RouterProvider.svelte";
  import type { Snippet } from "svelte";

  let {
    router,
  }: {
    router: AnyRouter;
  } = $props();
</script>

<RouterProvider {router} />
