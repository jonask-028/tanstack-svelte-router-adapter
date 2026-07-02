<script lang="ts">
  import { Block } from "../../../src/index.js";
</script>

<Block shouldBlockFn={() => true} disabled={true} withResolver={true}>
  {#snippet children({ status })}
    <span data-testid="block-disabled-status">{status}</span>
  {/snippet}
</Block>
