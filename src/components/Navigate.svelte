<!--
  Navigate — Imperative navigation component.
  Navigates on mount (useful for redirects in component trees).
  
  @example
  ```svelte
  <script lang="ts">
    import { Navigate } from '@tanstack/svelte-router'
  </script>
  
  {#if !isAuthenticated}
    <Navigate to="/login" />
  {/if}
  ```
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { getContext } from "svelte";
  import { ROUTER_CONTEXT_KEY } from "../context/keys.js";
  import type { AnyRouter } from "@tanstack/router-core";

  let {
    to,
    params,
    search,
    hash,
    replace = true,
  }: {
    to: string;
    params?: Record<string, string>;
    search?: Record<string, unknown>;
    hash?: string;
    replace?: boolean;
  } = $props();

  const router = getContext<AnyRouter>(ROUTER_CONTEXT_KEY);

  onMount(() => {
    router.navigate({
      to,
      params,
      search: search as any,
      hash,
      replace,
    } as any);
  });
</script>
