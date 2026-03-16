<!--
  Await.svelte — Renders deferred/async data with pending fallback.

  Uses Svelte's built-in {#await} block for native promise handling.
  Compatible with TanStack Router's `defer()` utility for streaming SSR.

  @example
  ```svelte
  <script>
    import { Await, defer } from '@tanstack/svelte-router'

    // In your loader:
    // return { data: defer(fetchData()) }
  </script>

  <Await promise={data.someDeferred}>
    {#snippet children(result)}
      <p>{result.name}</p>
    {/snippet}
    {#snippet fallback()}
      <p>Loading...</p>
    {/snippet}
  </Await>
  ```
-->
<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  let {
    promise,
    children,
    fallback,
  }: {
    promise: Promise<T>;
    children: Snippet<[T]>;
    fallback?: Snippet;
  } = $props();
</script>

{#await promise}
  {#if fallback}
    {@render fallback()}
  {/if}
{:then result}
  {@render children(result)}
{:catch error}
  <p>Error: {error?.message ?? String(error)}</p>
{/await}
