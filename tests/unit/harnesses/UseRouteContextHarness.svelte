<!--
  Test harness — Exercises useRouteContext hook inside a rendered component.
-->
<script lang="ts">
  import { useRouteContext } from "../../../src/hooks/useRouteContext.js";

  const context = useRouteContext({ strict: false });
</script>

<div data-testid="use-route-context-harness">
  <span data-testid="route-context">{JSON.stringify(context ?? {})}</span>
</div>
