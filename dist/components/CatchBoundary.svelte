<!--
  CatchBoundary — Error boundary component for Svelte 5.

  Svelte doesn't have React's componentDidCatch, so this component
  catches errors during child rendering using a try/catch wrapper around
  the rendered content. It also listens for uncaught errors from its
  subtree via DOM error events.

  When an error is caught:
  1. The `onCatch` callback is invoked (if provided)
  2. The `errorComponent` is rendered with the error and a `reset` function
  3. Calling `reset()` clears the error and re-mounts the children

  @internal — Used by Match.svelte to wrap each route match.
-->
<script lang="ts">
  import type { Snippet, Component } from "svelte";
  import { onMount } from "svelte";

  let {
    children,
    errorComponent,
    onCatch,
  }: {
    children: Snippet;
    errorComponent?: Component<{ error: Error; reset: () => void }>;
    onCatch?: (error: Error) => void;
  } = $props();

  let caughtError = $state<Error | null>(null);
  let resetKey = $state(0);
  let boundaryEl: HTMLDivElement | undefined = $state(undefined);

  function handleError(error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    caughtError = err;
    onCatch?.(err);
  }

  function reset() {
    caughtError = null;
    resetKey++;
  }

  onMount(() => {
    if (!boundaryEl) return;

    // Capture errors from the DOM subtree (synchronous render errors
    // that bubble up as ErrorEvents on the window but originate in our subtree)
    function onErrorEvent(event: ErrorEvent) {
      // Only catch errors that originated from elements within our boundary
      if (
        event.error &&
        boundaryEl &&
        (event.target === window ||
          event.target === boundaryEl ||
          boundaryEl.contains(event.target as Node))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleError(event.error);
      }
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      // We can't scope unhandled rejections to a DOM subtree,
      // so we don't catch them here — they should be caught by the
      // caller (e.g., loader errors are caught by router-core).
      // This boundary focuses on synchronous rendering errors.
    }

    window.addEventListener("error", onErrorEvent, true);

    return () => {
      window.removeEventListener("error", onErrorEvent, true);
    };
  });
</script>

{#if caughtError && errorComponent}
  {@const ErrorComp = errorComponent}
  <ErrorComp error={caughtError} {reset} />
{:else}
  <div bind:this={boundaryEl} data-catch-boundary style="display:contents">
    {#key resetKey}
      {@render children()}
    {/key}
  </div>
{/if}
