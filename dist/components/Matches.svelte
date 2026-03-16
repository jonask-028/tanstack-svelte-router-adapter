<!--
  Matches — Internal component that renders the matched route tree.
  Traverses the router's current matches and renders them in order.
  Handles global not-found state when no route matches the current URL.
-->
<script lang="ts">
  import Match from "./Match.svelte";
  import DefaultGlobalNotFound from "./DefaultGlobalNotFound.svelte";
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

  // Check if ANY match in the tree has a global not-found flag
  let hasGlobalNotFound = $derived(matches.some((m: any) => m.globalNotFound));

  // Resolve the not-found component from the root route or router defaults
  let NotFoundComponent = $derived(
    router.options.defaultNotFoundComponent ?? DefaultGlobalNotFound,
  );
</script>

{#if hasGlobalNotFound}
  {@const NotFoundComp = NotFoundComponent}
  <NotFoundComp />
{:else if firstMatch}
  <Match {router} matchId={firstMatch.id} {matches} matchIndex={0} />
{/if}
