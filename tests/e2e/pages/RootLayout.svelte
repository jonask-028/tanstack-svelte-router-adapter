<!--
  Test layout component — Renders a layout wrapper with an Outlet.
  Used in E2E integration tests for nested route rendering.
-->
<script lang="ts">
  import Outlet from "../../../src/components/Outlet.svelte";
  import Link from "../../../src/components/Link.svelte";
  import { getContext } from "svelte";
  import { ROUTER_STATE_KEY } from "../../../src/context/keys.js";
  import type { RouterState } from "@tanstack/router-core";

  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);
  let pathname = $derived(getState().location.pathname);
</script>

<div data-testid="root-layout">
  <nav data-testid="nav">
    <Link to="/">
      {#snippet children({ isActive })}
        <span data-testid="nav-home" data-active={isActive}>Home</span>
      {/snippet}
    </Link>
    <Link to="/about">
      {#snippet children({ isActive })}
        <span data-testid="nav-about" data-active={isActive}>About</span>
      {/snippet}
    </Link>
    <Link to="/posts">
      {#snippet children({ isActive })}
        <span data-testid="nav-posts" data-active={isActive}>Posts</span>
      {/snippet}
    </Link>
  </nav>
  <main data-testid="main-content">
    <Outlet />
  </main>
  <p data-testid="layout-pathname">{pathname}</p>
</div>
