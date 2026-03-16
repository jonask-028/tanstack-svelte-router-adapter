<!--
  Test harness — Exercises useChildMatches hook inside a rendered component.
-->
<script lang="ts">
  import { useChildMatches } from "../../../src/hooks/useChildMatches.js";

  const childMatches = useChildMatches();
</script>

<div data-testid="use-child-matches-harness">
  <span data-testid="child-matches-count">{childMatches.length}</span>
  <span data-testid="child-matches-ids"
    >{JSON.stringify(childMatches.map((m: any) => m.routeId))}</span
  >
</div>
