<script lang="ts">
  import { Block } from "../../../src/index.js";
  import { useRouter } from "../../../src/hooks/useRouter.js";

  const router = useRouter();
</script>

<Block shouldBlockFn={() => true} withResolver={true}>
  {#snippet children({ status, proceed, reset })}
    <span data-testid="block-status">{status}</span>
    <button data-testid="block-proceed" onclick={proceed}>Proceed</button>
    <button data-testid="block-reset" onclick={reset}>Reset</button>
  {/snippet}
</Block>

<button
  data-testid="trigger-nav"
  onclick={() => router.navigate({ to: "/other" })}
>
  Navigate
</button>
