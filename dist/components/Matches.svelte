<!--
  Matches — Internal component that renders the matched route tree.
  Traverses the router's current matches and renders them in order.
-->
<script lang="ts">
  import Match from "./Match.svelte";
  import type { AnyRouter, RouterState } from "@tanstack/router-core";

  let {
    router,
    state,
  }: {
    router: AnyRouter;
    state: RouterState<any>;
  } = $props();

  // Get the pending matches or the resolved matches
  let matches = $derived(state.pendingMatches ?? state.matches);

  // Get the first match to start the tree rendering
  let firstMatch = $derived(matches[0]);
</script>

{#if firstMatch}
  <Match {router} matchId={firstMatch.id} {matches} matchIndex={0} />
{/if}
