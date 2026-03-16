<!--
  Test page component — Home page that displays its route info.
  Used in E2E integration tests.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import {
    ROUTER_CONTEXT_KEY,
    ROUTER_STATE_KEY,
  } from "../../../src/context/keys.js";
  import type { AnyRouter, RouterState } from "@tanstack/router-core";

  const router = getContext<AnyRouter>(ROUTER_CONTEXT_KEY);
  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);

  let pathname = $derived(getState().location.pathname);
</script>

<div data-testid="home-page">
  <h1>Home Page</h1>
  <p data-testid="pathname">{pathname}</p>
</div>
