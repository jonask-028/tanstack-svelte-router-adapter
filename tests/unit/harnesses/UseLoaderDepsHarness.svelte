<!--
  Test harness — Exercises useLoaderDeps hook inside a rendered component.
-->
<script lang="ts">
  import { useLoaderDeps } from "../../../src/hooks/useLoaderDeps.js";

  const deps = useLoaderDeps({ strict: false });
</script>

<div data-testid="use-loader-deps-harness">
  <span data-testid="loader-deps">{JSON.stringify(deps ?? {})}</span>
</div>
