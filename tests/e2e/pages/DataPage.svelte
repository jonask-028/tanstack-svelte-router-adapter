<!--
  Test page component — Displays loader data.
  Used in E2E integration tests for loader/data flow testing.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import {
    ROUTER_CONTEXT_KEY,
    ROUTER_STATE_KEY,
    MATCH_CONTEXT_KEY,
  } from "../../../src/context/keys.js";
  import type { AnyRouter, RouterState } from "@tanstack/router-core";

  const router = getContext<AnyRouter>(ROUTER_CONTEXT_KEY);
  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);
  const getMatchId = getContext<() => string | undefined>(MATCH_CONTEXT_KEY);

  let loaderData = $derived.by(() => {
    const state = getState();
    const matchId = getMatchId();
    const match = state.matches.find((m: any) => m.id === matchId);
    return match?.loaderData;
  });
</script>

<div data-testid="data-page">
  <h1>Data Page</h1>
  {#if loaderData}
    <p data-testid="loader-message">{loaderData.message}</p>
    <p data-testid="loader-count">{loaderData.count}</p>
  {/if}
</div>
