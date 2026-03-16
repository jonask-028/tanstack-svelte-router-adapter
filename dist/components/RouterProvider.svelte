<!--
  RouterProvider — Root component that provides the router instance to all descendants.
  
  This is the Svelte equivalent of React's <RouterProvider router={router} />.
  It sets up the router context, subscribes to router state changes, handles
  the Transitioner lifecycle (history subscription, initial load, lifecycle
  events, hash scroll, URL canonicalization), then renders the matched route tree.
  
  @example
  ```svelte
  <script lang="ts">
    import { RouterProvider, createRouter } from '@tanstack/svelte-router'
    import { routeTree } from './routeTree.gen'
    
    const router = createRouter({ routeTree })
  </script>
  
  <RouterProvider {router} />
  ```
-->
<script lang="ts">
  import { setContext, onMount } from "svelte";
  import { ROUTER_CONTEXT_KEY, ROUTER_STATE_KEY } from "../context/keys.js";
  import {
    getLocationChangeInfo,
    handleHashScroll,
    trimPathRight,
  } from "@tanstack/router-core";
  import type { AnyRouter } from "@tanstack/router-core";
  import Matches from "./Matches.svelte";

  let {
    router,
    context,
  }: {
    router: AnyRouter;
    context?: Record<string, any>;
  } = $props();

  // Update router options if context is provided
  $effect(() => {
    if (context) {
      router.update({
        ...router.options,
        context: {
          ...router.options.context,
          ...context,
        },
      } as any);
    }
  });

  // Provide the router instance via Svelte context.
  // The router is a stable object reference — capturing it here is intentional.
  // svelte-ignore state_referenced_locally
  const routerRef = router;
  setContext(ROUTER_CONTEXT_KEY, routerRef);

  // Track router state for reactivity.
  // svelte-ignore state_referenced_locally
  let routerState = $state(routerRef.state);

  // Provide a reactive state getter via context so descendant components
  // (Outlet, Link, hooks) can reactively read router state.
  setContext(ROUTER_STATE_KEY, () => routerState);

  // ---------------------------------------------------------------------------
  // Transitioner — mirrors React adapter's Transitioner component.
  // Subscribes to history, triggers router.load(), emits lifecycle events,
  // handles hash scroll, and does URL canonicalization on mount.
  // ---------------------------------------------------------------------------

  // Track previous state values for lifecycle event detection
  let prevIsLoading: boolean | undefined = undefined;
  let prevIsPagePending: boolean | undefined = undefined;
  let prevIsAnyPending: boolean | undefined = undefined;
  let mounted = false;

  onMount(() => {
    // 1. Subscribe to router store for state reactivity
    const unsubStore = router.__store.subscribe(() => {
      routerState = router.state;
    });

    // 2. Subscribe to history changes → trigger router.load()
    //    This is critical for browser back/forward button support.
    const unsubHistory = router.history.subscribe(router.load);

    // 3. URL canonicalization — check if current URL matches canonical form
    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true,
    } as any);

    if (
      trimPathRight(router.latestLocation.publicHref) !==
      trimPathRight((nextLocation as any).publicHref)
    ) {
      router.commitLocation({ ...nextLocation, replace: true } as any);
    }

    // 4. Initial load — only if not SSR hydrating
    if (!(typeof window !== "undefined" && (router as any).ssr) && !mounted) {
      mounted = true;
      router.load().catch((err: unknown) => {
        console.error(err);
      });
    }

    return () => {
      unsubStore();
      unsubHistory();
    };
  });

  // Lifecycle event effects — track state transitions and emit events
  $effect(() => {
    const isLoading = routerState.isLoading;

    // Emit onLoad when loading transitions from true → false
    if (prevIsLoading === true && !isLoading) {
      router.emit({
        type: "onLoad",
        ...getLocationChangeInfo(router.state),
      } as any);
    }
    prevIsLoading = isLoading;
  });

  $effect(() => {
    const isLoading = routerState.isLoading;
    const hasPendingMatches = routerState.matches.some(
      (d: any) => d.status === "pending",
    );
    const isPagePending = isLoading || hasPendingMatches;

    // Emit onBeforeRouteMount when page pending transitions from true → false
    if (prevIsPagePending === true && !isPagePending) {
      router.emit({
        type: "onBeforeRouteMount",
        ...getLocationChangeInfo(router.state),
      } as any);
    }
    prevIsPagePending = isPagePending;
  });

  $effect(() => {
    const isLoading = routerState.isLoading;
    const hasPendingMatches = routerState.matches.some(
      (d: any) => d.status === "pending",
    );
    const isAnyPending = isLoading || hasPendingMatches;

    // Emit onResolved when all pending completes, handle hash scroll, set idle
    if (prevIsAnyPending === true && !isAnyPending) {
      const changeInfo = getLocationChangeInfo(router.state);
      router.emit({
        type: "onResolved",
        ...changeInfo,
      } as any);

      // Set router state to idle + resolvedLocation
      router.__store.setState((s: typeof router.state) => ({
        ...s,
        status: "idle",
        resolvedLocation: s.location,
      }));

      if ((changeInfo as any).hrefChanged) {
        handleHashScroll(router);
      }
    }
    prevIsAnyPending = isAnyPending;
  });
</script>

<Matches {router} state={routerState} />
