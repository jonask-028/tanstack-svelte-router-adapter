<!--
  Test page component — Displays search params.
  Used in E2E integration tests for search param testing.
-->
<script lang="ts">
  import { getContext } from "svelte";
  import { ROUTER_STATE_KEY } from "../../../src/context/keys.js";
  import type { RouterState } from "@tanstack/router-core";

  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);

  let search = $derived(getState().location.search);
</script>

<div data-testid="search-page">
  <h1>Search Page</h1>
  <p data-testid="search-q">{search?.q ?? ""}</p>
  <p data-testid="search-page-num">{search?.page ?? ""}</p>
</div>
