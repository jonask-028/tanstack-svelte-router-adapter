<!--
  Test page component — Throws an error during rendering.
  Used to test CatchBoundary error catching.
-->
<script lang="ts">
  // This component always throws during rendering
  throw new Error("Render explosion!");
</script>

<div data-testid="throwing-page">This should never render</div>
