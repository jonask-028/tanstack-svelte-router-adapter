<!--
  Test harness — Renders hooks inside a Svelte component with router context.
  Exposes results via data-testid attributes for assertion.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import {
    ROUTER_CONTEXT_KEY,
    ROUTER_STATE_KEY,
    MATCH_CONTEXT_KEY,
  } from "../../../src/context/keys.js";
  import {
    getRouterContext,
    getMatchContext,
    getRouterStateContext,
  } from "../../../src/context/getContext.js";
  import type { AnyRouter, RouterState } from "@tanstack/router-core";

  // Test getRouterContext
  let routerFromContext: AnyRouter | undefined;
  try {
    routerFromContext = getRouterContext();
  } catch {
    /* no context */
  }

  // Test getMatchContext
  let matchIdFromContext: string | undefined;
  try {
    matchIdFromContext = getMatchContext();
  } catch {
    /* no context */
  }

  // Test getRouterStateContext
  let stateGetter: (() => RouterState<any>) | undefined;
  try {
    stateGetter = getRouterStateContext();
  } catch {
    /* no context */
  }

  let statePathname = $derived(
    stateGetter ? stateGetter().location.pathname : "none",
  );
</script>

<div data-testid="context-harness">
  <span data-testid="has-router">{!!routerFromContext}</span>
  <span data-testid="match-id">{matchIdFromContext ?? "none"}</span>
  <span data-testid="state-pathname">{statePathname}</span>
</div>
