<!--
  Test harness — Exercises useRouter hook inside a rendered component.
-->
<script lang="ts">
  import { useRouter } from "../../../src/hooks/useRouter.js";

  let routerResult: any;
  let hasError = false;
  try {
    routerResult = useRouter({ warn: false });
  } catch {
    hasError = true;
  }
</script>

<div data-testid="use-router-harness">
  <span data-testid="has-router">{!!routerResult}</span>
  <span data-testid="has-error">{hasError}</span>
  {#if routerResult}
    <span data-testid="router-state-pathname"
      >{routerResult.state?.location?.pathname ?? "unknown"}</span
    >
  {/if}
</div>
