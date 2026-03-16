<!--
  Test harness — Exercises useBlocker hook reactivity inside a rendered component.
  Verifies that $state runes trigger UI updates when blocker status changes.
-->
<script lang="ts">
  import { useBlocker } from "../../../src/hooks/useBlocker.svelte.js";
  import { useNavigate } from "../../../src/hooks/useNavigate.js";
  import type { BlockerResolver } from "../../../src/hooks/useBlocker.svelte.js";

  // Always block navigation with resolver
  const blocker = useBlocker({
    shouldBlockFn: () => true,
    withResolver: true,
  }) as BlockerResolver;

  const navigate = useNavigate();

  function triggerNavigation() {
    navigate({ to: "/other" });
  }
</script>

<div data-testid="use-blocker-harness">
  <span data-testid="blocker-status">{blocker.status}</span>
  <button data-testid="trigger-nav" onclick={triggerNavigation}>Navigate</button
  >
  {#if blocker.status === "blocked"}
    <button data-testid="blocker-proceed" onclick={blocker.proceed}
      >Proceed</button
    >
    <button data-testid="blocker-reset" onclick={blocker.reset}>Reset</button>
    <span data-testid="blocker-next-pathname">{blocker.next?.pathname}</span>
  {/if}
</div>
