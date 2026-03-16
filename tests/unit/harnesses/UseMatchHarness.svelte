<!--
  Test harness — Exercises useMatch hook inside a rendered component.
-->
<script lang="ts">
  import { useMatch } from "../../../src/hooks/useMatch.js";

  let { from }: { from?: string } = $props();

  let match = $derived(useMatch({ from } as any));
</script>

<div data-testid="use-match-harness">
  <span data-testid="match-route-id">{match?.routeId ?? "none"}</span>
  <span data-testid="match-params">{JSON.stringify(match?.params ?? {})}</span>
  <span data-testid="match-status">{match?.status ?? "none"}</span>
</div>
