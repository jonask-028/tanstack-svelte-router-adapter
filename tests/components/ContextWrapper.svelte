<!--
  Test wrapper — Sets up router context and renders a child snippet.
  This allows us to test any component that needs router context
  without going through the full RouterProvider/Matches tree.
-->
<script lang="ts">
  import { setContext, onDestroy } from "svelte";
  import {
    ROUTER_CONTEXT_KEY,
    ROUTER_STATE_KEY,
    MATCH_CONTEXT_KEY,
  } from "../../src/context/keys.js";
  import type { AnyRouter } from "@tanstack/router-core";
  import type { Snippet } from "svelte";

  let {
    router,
    matchId,
    children,
  }: {
    router: AnyRouter;
    matchId?: string;
    children?: Snippet;
  } = $props();

  // Provide the router instance via context
  // svelte-ignore state_referenced_locally
  const routerRef = router;
  setContext(ROUTER_CONTEXT_KEY, routerRef);

  // Provide a reactive state getter via context
  // svelte-ignore state_referenced_locally
  let routerState = $state(routerRef.state);
  setContext(ROUTER_STATE_KEY, () => routerState);

  // Provide a match context if matchId is given
  // svelte-ignore state_referenced_locally
  const matchIdRef = matchId;
  if (matchIdRef !== undefined) {
    setContext(MATCH_CONTEXT_KEY, () => matchIdRef);
  }

  // Subscribe to router state changes
  // svelte-ignore state_referenced_locally
  const unsub = routerRef.__store.subscribe(() => {
    routerState = routerRef.state;
  });

  onDestroy(unsub);
</script>

{@render children?.()}
