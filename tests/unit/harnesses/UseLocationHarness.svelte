<!--
  Test harness — Exercises location reading via useRouterState.

  NOTE: useLocation() reads state.resolvedLocation which may be undefined
  at component init time (only populated after a navigation resolves).
  We use state.location here instead, which is always available.
-->
<script lang="ts">
  import { useRouterState } from "../../../src/hooks/useRouterState.js";

  const location = useRouterState({ select: (s) => s.location });
</script>

<div data-testid="use-location-harness">
  <span data-testid="location-pathname">{location?.pathname ?? "none"}</span>
  <span data-testid="location-search"
    >{JSON.stringify(location?.search ?? {})}</span
  >
  <span data-testid="location-hash">{location?.hash ?? ""}</span>
</div>
