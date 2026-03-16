<!--
  Test harness — Exercises useParams hook inside a rendered component.
-->
<script lang="ts">
  import { useParams } from "../../../src/hooks/useParams.js";

  const params = useParams();
</script>

<div data-testid="use-params-harness">
  <span data-testid="params">{JSON.stringify(params)}</span>
</div>
