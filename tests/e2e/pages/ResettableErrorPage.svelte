<!--
  Test page component — Error page with reset functionality.
  Used to test CatchBoundary reset behavior.
-->
<script lang="ts">
  let { error, reset }: { error: Error; reset?: () => void } = $props();
</script>

<div data-testid="resettable-error-page">
  <p data-testid="error-message">{error?.message ?? "Unknown error"}</p>
  {#if reset}
    <button data-testid="reset-button" onclick={reset}>Try Again</button>
  {/if}
</div>
