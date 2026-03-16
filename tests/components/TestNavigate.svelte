<!--
  Test wrapper — Renders a Navigate inside router context.
-->
<script lang="ts">
  import type { AnyRouter } from "@tanstack/router-core";
  import ContextWrapper from "./ContextWrapper.svelte";
  import Navigate from "../../src/components/Navigate.svelte";

  let {
    router,
    to,
    params,
    search,
    hash,
    replace,
  }: {
    router: AnyRouter;
    to: string;
    params?: Record<string, string>;
    search?: Record<string, unknown>;
    hash?: string;
    replace?: boolean;
  } = $props();
</script>

<ContextWrapper {router}>
  <Navigate {to} {params} {search} {hash} {replace} />
</ContextWrapper>
