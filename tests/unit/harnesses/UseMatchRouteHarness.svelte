<!--
  Test harness — Exercises useMatchRoute hook inside a rendered component.
-->
<script lang="ts">
  import { useMatchRoute } from "../../../src/hooks/useMatchRoute.js";

  const matchRoute = useMatchRoute();
  const indexMatch = matchRoute({ to: "/" });
  const aboutMatch = matchRoute({ to: "/about" });
</script>

<div data-testid="use-match-route-harness">
  <span data-testid="has-match-route">{typeof matchRoute === "function"}</span>
  <span data-testid="index-match">{JSON.stringify(indexMatch)}</span>
  <span data-testid="about-match">{JSON.stringify(aboutMatch)}</span>
</div>
