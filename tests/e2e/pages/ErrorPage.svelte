<!--
  Test page component — Error page component.
  Displayed when a route throws an error.
-->
<script lang="ts">
  let { error }: { error: Error } = $props();
</script>

<div data-testid="error-page">
  <h1>Error!</h1>
  <p data-testid="error-message">{error?.message ?? "Unknown error"}</p>
</div>
