<!--
  Test harness — Exercises useCanGoBack hook inside a rendered component.
-->
<script lang="ts">
  import { useCanGoBack } from "../../../src/hooks/useCanGoBack.js";

  const canGoBack = useCanGoBack();
</script>

<div data-testid="use-can-go-back-harness">
  <span data-testid="can-go-back">{canGoBack}</span>
</div>
