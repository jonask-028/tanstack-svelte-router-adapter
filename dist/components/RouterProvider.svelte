<!--
  RouterProvider — Root component that provides the router instance to all descendants.
  
  This is the Svelte equivalent of React's <RouterProvider router={router} />.
  It sets up the router context and subscribes to router state changes,
  then renders the matched route tree.
  
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
  import { setContext, onMount, onDestroy } from "svelte";
  import { ROUTER_CONTEXT_KEY, ROUTER_STATE_KEY } from "../context/keys.js";
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

  onMount(() => {
    // Subscribe to router store — fires on every state change so we
    // catch all navigations, redirects, and loader updates reliably.
    const unsub = router.__store.subscribe(() => {
      routerState = router.state;
    });

    return unsub;
  });
</script>

<Matches {router} state={routerState} />
