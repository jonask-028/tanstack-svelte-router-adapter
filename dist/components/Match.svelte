<!--
  Match — Internal component that renders a single route match and its children.
  Handles the recursive route tree rendering, error boundaries, pending states,
  and not-found handling.

  Each match is wrapped in:
  1. CatchBoundary — catches runtime rendering errors → shows errorComponent
  2. CatchNotFound — catches notFound() throws → shows notFoundComponent

  This mirrors the React adapter's `Matches.tsx` wrapping strategy.
-->
<script lang="ts">
  import { setContext } from "svelte";
  import { MATCH_CONTEXT_KEY } from "../context/keys.js";
  import type { AnyRouter } from "@tanstack/router-core";
  import Self from "./Match.svelte";
  import CatchBoundary from "./CatchBoundary.svelte";
  import CatchNotFound from "./CatchNotFound.svelte";
  import DefaultErrorComponent from "./ErrorComponent.svelte";
  import DefaultGlobalNotFound from "./DefaultGlobalNotFound.svelte";

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

  // Resolve error component: route-specific → router default → built-in default
  let ResolvedErrorComponent = $derived(
    route?.options?.errorComponent !== false &&
      route?.options?.errorComponent !== null
      ? (route?.options?.errorComponent ??
          router.options.defaultErrorComponent ??
          DefaultErrorComponent)
      : undefined,
  );

  // Resolve not-found component: route-specific → router default → built-in default
  let ResolvedNotFoundComponent = $derived(
    route?.options?.notFoundComponent ??
      router.options.defaultNotFoundComponent ??
      DefaultGlobalNotFound,
  );

  // Find the next child match (the match that comes after this one in the array)
  let childMatch = $derived(matches[matchIndex + 1]);

  // Whether this match has an error (set by router-core when loaders throw)
  let hasError = $derived(match?.error);

  // Whether this match has a not-found error
  let isNotFound = $derived(
    match?.globalNotFound ||
      (match?.isFetching === false && match?.status === "notFound"),
  );

  // Whether the match is still loading
  let isPending = $derived(match?.status === "pending");
</script>

{#key matchId}
  {#if hasError && ResolvedErrorComponent}
    <!-- Loader errors (caught by router-core before rendering) -->
    {@const ErrorComp = ResolvedErrorComponent}
    <ErrorComp error={match.error} reset={() => router.invalidate()} />
  {:else if isNotFound && ResolvedNotFoundComponent}
    <!-- Not-found state from loader -->
    {@const NotFoundComp = ResolvedNotFoundComponent}
    <NotFoundComp data={match?.notFoundData} />
  {:else if isPending && PendingComponent}
    <PendingComponent />
  {:else}
    <!-- Wrap in error + not-found boundaries for runtime rendering errors -->
    <CatchBoundary
      errorComponent={ResolvedErrorComponent}
      onCatch={(error) => {
        // Log the error for debugging
        console.error(`[TanStack Router] Error in route "${matchId}":`, error);
      }}
    >
      {#snippet children()}
        <CatchNotFound fallback={ResolvedNotFoundComponent}>
          {#snippet children()}
            {#if Component}
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
          {/snippet}
        </CatchNotFound>
      {/snippet}
    </CatchBoundary>
  {/if}
{/key}
