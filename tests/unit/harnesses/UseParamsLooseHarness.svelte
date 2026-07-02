<!--
  Test harness — Exercises useParams hook with strict: false.
-->
<script lang="ts">
  import { useParams } from "../../../src/hooks/useParams.js";

  const params = $derived(useParams({ strict: false }));
</script>

<div data-testid="use-params-loose-harness">
  <span data-testid="params-loose">{JSON.stringify(params)}</span>
</div>
