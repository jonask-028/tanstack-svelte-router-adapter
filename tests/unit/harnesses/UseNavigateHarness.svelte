<!--
  Test harness — Exercises useNavigate hook inside a rendered component.
-->
<script lang="ts">
  import { useNavigate } from "../../../src/hooks/useNavigate.js";

  const navigate = useNavigate();
  let navigated = $state(false);
  let error = $state("");

  async function doNavigate() {
    try {
      await navigate({ to: "/about" });
      navigated = true;
    } catch (e: any) {
      error = e.message ?? "unknown";
    }
  }
</script>

<div data-testid="use-navigate-harness">
  <span data-testid="has-navigate">{typeof navigate === "function"}</span>
  <span data-testid="navigated">{navigated}</span>
  <span data-testid="navigate-error">{error}</span>
  <!-- svelte-ignore event_directive_deprecated -->
  <button data-testid="do-navigate" on:click={doNavigate}>Navigate</button>
</div>
