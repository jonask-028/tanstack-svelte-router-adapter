<!--
  ErrorComponent — Default error fallback component.

  Rendered by CatchBoundary when a route's component throws an error
  and no route-specific `errorComponent` is defined.

  Displays the error message and a "Try Again" button that calls `reset()`
  to clear the error and re-mount the component.
-->
<script lang="ts">
  let {
    error,
    reset,
  }: {
    error: Error;
    reset?: () => void;
  } = $props();
</script>

<div
  data-testid="default-error-component"
  style="padding:1rem;font-family:system-ui,sans-serif;"
>
  <h2 style="color:#dc2626;margin:0 0 0.5rem;">Something went wrong</h2>
  <pre
    style="background:#fef2f2;border:1px solid #fecaca;border-radius:0.375rem;padding:0.75rem;overflow-x:auto;font-size:0.875rem;white-space:pre-wrap;">{error.message}</pre>
  {#if reset}
    <button
      onclick={reset}
      style="margin-top:0.5rem;padding:0.375rem 0.75rem;background:#f3f4f6;border:1px solid #d1d5db;border-radius:0.375rem;cursor:pointer;font-size:0.875rem;"
    >
      Try Again
    </button>
  {/if}
</div>
