<!--
  Minimal App component for SSR testing.
  Simply renders the router state into the HTML.
-->
<script lang="ts">
  import type { AnyRouter } from "@tanstack/router-core";

  let { router }: { router: AnyRouter } = $props();
</script>

<html lang="en">
  <head><title>SSR Test</title></head>
  <body>
    <div id="app">
      <span data-testid="ssr-pathname">{router.state.location.pathname}</span>
      <span data-testid="ssr-status">{router.state.statusCode}</span>
      {#each router.state.matches as match}
        <span data-testid="ssr-match-{match.routeId}">{match.routeId}</span>
      {/each}
    </div>
  </body>
</html>
