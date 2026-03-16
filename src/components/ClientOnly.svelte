<!--
  ClientOnly.svelte — Renders children only on the client (after hydration).

  On the server or during SSR hydration, renders the optional fallback.
  Once the component is mounted on the client, renders children.

  @example
  ```svelte
  <script>
    import { ClientOnly } from '@tanstack/svelte-router'
  </script>

  <ClientOnly>
    {#snippet children()}
      <canvas id="webgl-canvas" />
    {/snippet}
    {#snippet fallback()}
      <div>Loading canvas...</div>
    {/snippet}
  </ClientOnly>
  ```
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  let {
    children,
    fallback,
  }: {
    children: Snippet;
    fallback?: Snippet;
  } = $props();

  let hydrated = $state(false);

  onMount(() => {
    hydrated = true;
  });
</script>

{#if hydrated}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
