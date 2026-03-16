<!--
  MatchRoute.svelte — Conditionally renders children when a route matches.

  This is a declarative wrapper around `useMatchRoute()`. It checks if the given
  route options match the current location and renders children if they do.

  @example
  ```svelte
  <script>
    import { MatchRoute } from '@tanstack/svelte-router'
  </script>

  <MatchRoute to="/posts/$postId" params={{ postId: '123' }}>
    {#snippet children(match)}
      <span>Post 123 is active! Params: {JSON.stringify(match)}</span>
    {/snippet}
  </MatchRoute>
  ```
-->
<script lang="ts">
  import { useMatchRoute } from "../hooks/useMatchRoute.js";
  import type { Snippet } from "svelte";
  import type {
    MakeRouteMatch,
    MatchRouteOptions,
  } from "@tanstack/router-core";

  let {
    children,
    pending,
    caseSensitive,
    ...routeOpts
  }: {
    children?: Snippet<[any]>;
    pending?: boolean;
    caseSensitive?: boolean;
    to?: string;
    from?: string;
    params?: Record<string, any>;
    search?: Record<string, any>;
    fuzzy?: boolean;
  } = $props();

  const matchRoute = useMatchRoute();
  let match = $derived(
    matchRoute({
      ...routeOpts,
      pending,
      caseSensitive,
    } as any),
  );
</script>

{#if match && children}
  {@render children(match)}
{/if}
