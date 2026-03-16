<!--
  CatchNotFound — Catches `notFound()` errors and renders a not-found fallback.

  This component wraps its children in a CatchBoundary. When a notFound() error
  is thrown (either from a loader or during component rendering), it intercepts
  the error and renders the `fallback` component instead of the default error UI.

  Non-notFound errors are re-thrown to be caught by the outer CatchBoundary.

  @internal — Used by Match.svelte to wrap each route match.
-->
<script lang="ts">
  import type { Snippet, Component } from "svelte";
  import { isNotFound } from "@tanstack/router-core";
  import CatchBoundary from "./CatchBoundary.svelte";

  let {
    children,
    fallback,
  }: {
    children: Snippet;
    fallback?: Component<{ data?: any }>;
  } = $props();

  let notFoundError = $state<any>(null);

  function onCatch(error: Error) {
    if (isNotFound(error)) {
      notFoundError = error;
    } else {
      // Re-throw non-notFound errors so the parent CatchBoundary catches them
      throw error;
    }
  }
</script>

{#if notFoundError && fallback}
  {@const NotFoundComp = fallback}
  <NotFoundComp data={notFoundError.data} />
{:else}
  <CatchBoundary {onCatch}>
    {#snippet children()}
      {@render children()}
    {/snippet}
  </CatchBoundary>
{/if}
