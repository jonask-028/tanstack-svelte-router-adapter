<!--
  Test harness — Exercises useRouterState hook inside a rendered component.
-->
<script lang="ts">
  import { useRouterState } from "../../../src/hooks/useRouterState.js";

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchObj = useRouterState({ select: (s) => s.location.search });
  const matchCount = useRouterState({ select: (s) => s.matches.length });
</script>

<div data-testid="use-router-state-harness">
  <span data-testid="pathname">{pathname}</span>
  <span data-testid="search">{JSON.stringify(searchObj)}</span>
  <span data-testid="match-count">{matchCount}</span>
</div>
