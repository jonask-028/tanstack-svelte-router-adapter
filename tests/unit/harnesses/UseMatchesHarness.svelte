<!--
  Test harness — Exercises useMatches hook inside a rendered component.
-->
<script lang="ts">
  import { useMatches } from "../../../src/hooks/useMatches.js";

  const matches = useMatches();
</script>

<div data-testid="use-matches-harness">
  <span data-testid="matches-count">{matches.length}</span>
  <span data-testid="matches-ids"
    >{JSON.stringify(matches.map((m: any) => m.routeId))}</span
  >
</div>
