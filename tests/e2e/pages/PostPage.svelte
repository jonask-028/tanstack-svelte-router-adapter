<!--
  Test page component — Displays route params (e.g. post detail).
  Used in E2E integration tests for param testing.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import {
    ROUTER_STATE_KEY,
    MATCH_CONTEXT_KEY,
  } from "../../../src/context/keys.js";
  import type { RouterState } from "@tanstack/router-core";

  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);
  const getMatchId = getContext<() => string | undefined>(MATCH_CONTEXT_KEY);

  let params = $derived.by(() => {
    const state = getState();
    const matchId = getMatchId();
    const match = state.matches.find((m: any) => m.id === matchId);
    return match?.params ?? {};
  });
</script>

<div data-testid="post-page">
  <h1>Post Detail</h1>
  <p data-testid="post-id">{params.postId}</p>
</div>
