<!--
  Test harness — Exercises useParentMatches hook inside a rendered component.
-->
<script lang="ts">
  import { useParentMatches } from "../../../src/hooks/useParentMatches.js";

  const parentMatches = useParentMatches();
</script>

<div data-testid="use-parent-matches-harness">
  <span data-testid="parent-matches-count">{parentMatches.length}</span>
  <span data-testid="parent-matches-ids"
    >{JSON.stringify(parentMatches.map((m: any) => m.routeId))}</span
  >
</div>
