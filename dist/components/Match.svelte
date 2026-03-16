<!--
  Match — Internal component that renders a single route match and its children.
  Handles the recursive route tree rendering, error boundaries, and pending states.
-->
<script lang="ts">
  import { setContext } from "svelte";
  import { MATCH_CONTEXT_KEY } from "../context/keys.js";
  import type { AnyRouter } from "@tanstack/router-core";
  import Self from "./Match.svelte";

  let {
    router,
    matchId,
    matches,
    matchIndex,
  }: {
    router: AnyRouter;
    matchId: string;
    matches: Array<any>;
    matchIndex: number;
  } = $props();

  // Set the match context as a getter so it stays reactive when matchId prop changes.
  // Descendant components (Outlet) call this getter inside $derived to track changes.
  setContext(MATCH_CONTEXT_KEY, () => matchId);

  // Get the current match
  let match = $derived(matches.find((m: any) => m.id === matchId));

  // Get the route for this match
  let route = $derived(match ? router.routesById[match.routeId] : undefined);

  // Get the component to render
  let Component = $derived(route?.options?.component);

  // Check for pending component
  let PendingComponent = $derived(route?.options?.pendingComponent);

  // Check for error component
  let ErrorComponent = $derived(route?.options?.errorComponent);

  // Find the next child match (the match that comes after this one in the array)
  let childMatch = $derived(matches[matchIndex + 1]);

  // Whether this match has an error
  let hasError = $derived(match?.error);

  // Whether the match is still loading
  let isPending = $derived(match?.status === "pending");
</script>

{#key matchId}
  {#if hasError && ErrorComponent}
    <ErrorComponent error={match.error} />
  {:else if isPending && PendingComponent}
    <PendingComponent />
  {:else if Component}
    <Component>
      {#if childMatch}
        <Self
          {router}
          matchId={childMatch.id}
          {matches}
          matchIndex={matchIndex + 1}
        />
      {/if}
    </Component>
  {:else if childMatch}
    <!-- No component for this match (layout routes), render child directly -->
    <Self
      {router}
      matchId={childMatch.id}
      {matches}
      matchIndex={matchIndex + 1}
    />
  {/if}
{/key}
