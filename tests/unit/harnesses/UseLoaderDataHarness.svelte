<!--
  Test harness — Exercises useLoaderData hook inside a rendered component.
-->
<script lang="ts">
  import { useLoaderData } from "../../../src/hooks/useLoaderData.js";

  const data = useLoaderData({ strict: false });
</script>

<div data-testid="use-loader-data-harness">
  <span data-testid="loader-data">{JSON.stringify(data ?? null)}</span>
</div>
