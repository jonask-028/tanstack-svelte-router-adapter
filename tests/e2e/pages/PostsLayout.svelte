<!--
  Test page component — Posts listing layout with Outlet for child routes.
  Used in E2E integration tests.
-->
<script lang="ts">
  import Outlet from "../../../src/components/Outlet.svelte";
</script>

<div data-testid="posts-layout">
  <h1>Posts</h1>
  <Outlet />
</div>
