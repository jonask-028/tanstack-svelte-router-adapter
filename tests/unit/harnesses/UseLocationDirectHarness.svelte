<!--
  Test harness — Exercises useLocation hook directly inside a rendered component.
  Unlike UseLocationHarness.svelte (which uses useRouterState), this tests
  the actual useLocation hook.
-->
<script lang="ts">
  import { useLocation } from "../../../src/hooks/useLocation.js";

  const location = useLocation();
</script>

<div data-testid="use-location-direct-harness">
  <span data-testid="loc-pathname">{location?.pathname ?? "none"}</span>
  <span data-testid="loc-search">{JSON.stringify(location?.search ?? {})}</span>
  <span data-testid="loc-hash">{location?.hash ?? ""}</span>
</div>
