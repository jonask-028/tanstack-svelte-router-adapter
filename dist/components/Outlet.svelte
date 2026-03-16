<!--
  Outlet — Renders the child route match for the current route.
  Place this in layout components where you want child routes to render.
  This is the Svelte equivalent of React Router's Outlet.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import {
    MATCH_CONTEXT_KEY,
    ROUTER_CONTEXT_KEY,
    ROUTER_STATE_KEY,
  } from "../context/keys.js";
  import type { AnyRouter, RouterState } from "@tanstack/router-core";
  import Match from "./Match.svelte";

  const router = getContext<AnyRouter>(ROUTER_CONTEXT_KEY);
  const getMatchId = getContext<() => string | undefined>(MATCH_CONTEXT_KEY);
  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);

  // Use the reactive state getter — $derived calls getState() which reads
  // the $state variable in RouterProvider, creating a reactive dependency.
  let matches = $derived.by(() => {
    const state = getState();
    return state.pendingMatches ?? state.matches;
  });

  // Use the reactive match ID getter from the parent Match component.
  let matchId = $derived(getMatchId());

  let currentIndex = $derived(
    matchId ? matches.findIndex((m: any) => m.id === matchId) : -1,
  );

  let childMatch = $derived(
    currentIndex >= 0 && currentIndex < matches.length - 1
      ? matches[currentIndex + 1]
      : undefined,
  );
</script>

{#if childMatch}
  <Match
    {router}
    matchId={childMatch.id}
    {matches}
    matchIndex={currentIndex + 1}
  />
{/if}
