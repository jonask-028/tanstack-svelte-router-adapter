<!--
  Test harness — Exercises useSearch hook inside a rendered component.
-->
<script lang="ts">
  import { useSearch } from "../../../src/hooks/useSearch.js";

  const search = useSearch();
</script>

<div data-testid="use-search-harness">
  <span data-testid="search">{JSON.stringify(search)}</span>
</div>
