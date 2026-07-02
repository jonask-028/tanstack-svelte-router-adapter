<!--
  Test harness — ClientOnly without fallback.
-->
<script lang="ts">
  import ClientOnly from "../../../src/components/ClientOnly.svelte";
</script>

<ClientOnly>
  {#snippet children()}
    <span data-testid="client-content">Client Content</span>
  {/snippet}
</ClientOnly>
