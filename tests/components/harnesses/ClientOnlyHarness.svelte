<!--
  Test harness — Wraps ClientOnly component with proper Svelte 5 snippets.
-->
<script lang="ts">
  import ClientOnly from "../../../src/components/ClientOnly.svelte";
</script>

<ClientOnly>
  {#snippet children()}
    <span data-testid="client-content">Client Content</span>
  {/snippet}
  {#snippet fallback()}
    <span data-testid="fallback-content">Loading...</span>
  {/snippet}
</ClientOnly>
