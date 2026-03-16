<!--
  Link — Router-aware anchor element that handles client-side navigation.
  Supports active state detection, preloading, masking, view transitions, and
  type-safe route paths. Matches the official TanStack Router adapter patterns
  (solid-router, vue-router, react-router).

  @example
  ```svelte
  <script lang="ts">
    import { Link } from '@tanstack/svelte-router'
  </script>

  <Link to="/orgs">Organizations</Link>
  <Link to="/orgs/$id" params={{ id: '123' }}>Org Detail</Link>
  <Link to="/orgs" activeProps={{ class: 'font-bold' }}>Active Link</Link>
  <Link to="./edit" from="/orgs/$id">Relative Link</Link>
  ```
-->
<script lang="ts">
  import { getContext } from "svelte";
  import { ROUTER_CONTEXT_KEY, ROUTER_STATE_KEY } from "../context/keys.js";
  import {
    exactPathTest,
    functionalUpdate,
  } from "@tanstack/router-core";
  import type {
    AnyRouter,
    RouterState,
  } from "@tanstack/router-core";
  import type { Snippet } from "svelte";

  // ---------------------------------------------------------------------------
  // Props — aligned with solid-router / vue-router / react-router Link
  // ---------------------------------------------------------------------------
  let {
    // Navigation options
    to,
    from,
    params,
    search,
    hash,
    state: linkState,
    mask,
    replace,
    resetScroll,
    viewTransition,
    startTransition,
    hashScrollIntoView,
    ignoreBlocker,
    reloadDocument,
    // Preload
    preload,
    preloadDelay,
    // Active state
    activeProps,
    inactiveProps,
    activeOptions,
    // Element
    target,
    disabled = false,
    children,
    class: className,
    style,
    // Event handlers
    onclick,
    onmouseenter,
    onmouseleave,
    onfocus,
    ontouchstart,
    // Rest
    ...restProps
  }: {
    to: string;
    from?: string;
    params?: Record<string, string>;
    search?:
      | Record<string, unknown>
      | ((prev: Record<string, unknown>) => Record<string, unknown>);
    hash?: string | ((prev: string) => string);
    state?: Record<string, unknown>;
    mask?: {
      to?: string;
      from?: string;
      params?: Record<string, string>;
      search?: Record<string, unknown>;
      hash?: string;
      state?: Record<string, unknown>;
      unmaskOnReload?: boolean;
    };
    replace?: boolean;
    resetScroll?: boolean;
    viewTransition?: boolean;
    startTransition?: boolean;
    hashScrollIntoView?: boolean | ScrollIntoViewOptions;
    ignoreBlocker?: boolean;
    reloadDocument?: boolean;
    preload?: "intent" | "render" | "viewport" | false;
    preloadDelay?: number;
    activeProps?: Record<string, any> | (() => Record<string, any>);
    inactiveProps?: Record<string, any> | (() => Record<string, any>);
    activeOptions?: {
      exact?: boolean;
      includeSearch?: boolean;
      includeHash?: boolean;
    };
    target?: string;
    disabled?: boolean;
    children?: Snippet<[{ isActive: boolean; isTransitioning: boolean }]>;
    class?: string;
    style?: string | Record<string, string>;
    onclick?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
    onfocus?: (e: FocusEvent) => void;
    ontouchstart?: (e: TouchEvent) => void;
    [key: string]: any;
  } = $props();

  const router = getContext<AnyRouter>(ROUTER_CONTEXT_KEY);
  const getState = getContext<() => RouterState<any>>(ROUTER_STATE_KEY);

  // Transitioning state
  let isTransitioning = $state(false);

  // Build navigation options (from is pinned to avoid reactivity de-opt)
  let navOptions = $derived({
    to,
    from,
    params,
    search: search as any,
    hash,
    state: linkState,
    mask,
  });

  // Build the resolved location
  let next = $derived.by(() => {
    // Read reactive state so we re-evaluate when location changes
    getState();
    try {
      return router.buildLocation(navOptions as any);
    } catch {
      return undefined;
    }
  });

  // Use publicHref (handles masking, rewrites, etc.)
  let href = $derived.by(() => {
    if (disabled) return undefined;
    if (!next) return to;
    const loc = (next as any).maskedLocation ?? next;
    return (loc as any).publicHref ?? loc.href ?? to;
  });

  // Check if this link is active
  let isActive = $derived.by(() => {
    if (!next) return false;
    // Read state for reactivity
    const s = getState();
    try {
      if (activeOptions?.exact) {
        const testExact = exactPathTest(
          s.location.pathname,
          next.pathname,
          router.basepath,
        );
        if (!testExact) return false;
      } else {
        const matchResult = router.matchRoute(
          { to, from, params, search: search as any } as any,
          { caseSensitive: false, fuzzy: true },
        );
        if (!matchResult) return false;
      }

      // Optionally match search params
      if (activeOptions?.includeSearch) {
        // deep compare next.search with current search
        const currentSearch = s.location.search;
        const targetSearch = next.search;
        if (JSON.stringify(currentSearch) !== JSON.stringify(targetSearch)) {
          return false;
        }
      }

      // Optionally match hash
      if (activeOptions?.includeHash) {
        if (s.location.hash !== next.hash) return false;
      }

      return true;
    } catch {
      return false;
    }
  });

  // Resolve active/inactive props (support functional form)
  let resolvedActiveProps: Record<string, any> = $derived(
    isActive ? (functionalUpdate(activeProps as any, {}) ?? {}) : {},
  );
  let resolvedInactiveProps: Record<string, any> = $derived(
    isActive ? {} : (functionalUpdate(inactiveProps as any, {}) ?? {}),
  );

  // Combine classes
  let resolvedClass = $derived.by(() => {
    const classes = [
      className,
      resolvedActiveProps?.class,
      resolvedInactiveProps?.class,
    ]
      .filter(Boolean)
      .join(" ");
    return classes || undefined;
  });

  // Merge styles
  let resolvedStyle = $derived.by(() => {
    const base = style;
    const activeStyle = resolvedActiveProps?.style;
    const inactiveStyle = resolvedInactiveProps?.style;

    if (!base && !activeStyle && !inactiveStyle) return undefined;

    // If all are strings, concatenate
    if (typeof base === "string" || typeof activeStyle === "string" || typeof inactiveStyle === "string") {
      return [base, activeStyle, inactiveStyle].filter(Boolean).join("; ");
    }

    // If objects, merge
    return { ...(base as any), ...(activeStyle as any), ...(inactiveStyle as any) };
  });

  // Computed preload values
  let effectivePreload = $derived(
    reloadDocument ? false : (preload ?? router.options.defaultPreload),
  );
  let effectivePreloadDelay = $derived(
    preloadDelay ?? router.options.defaultPreloadDelay ?? 50,
  );

  let preloadTimeout: ReturnType<typeof setTimeout> | undefined;

  // Filter out Link-specific keys from restProps to avoid passing them to <a>
  function getSafeRestProps() {
    const unsafe = new Set([
      "params", "search", "hash", "state", "mask",
      "reloadDocument", "unsafeRelative", "from",
      "resetScroll", "viewTransition", "startTransition",
      "hashScrollIntoView", "ignoreBlocker",
    ]);
    const safe: Record<string, any> = {};
    for (const key of Object.keys(restProps)) {
      if (!unsafe.has(key)) {
        safe[key] = restProps[key];
      }
    }
    return safe;
  }

  function doPreload() {
    router.preloadRoute(navOptions as any).catch(() => {});
  }

  function handleClick(e: MouseEvent) {
    onclick?.(e);

    if (
      e.defaultPrevented ||
      disabled ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.button !== 0 ||
      (target && target !== "_self")
    ) {
      return;
    }

    // Let the browser handle reloadDocument links normally
    if (reloadDocument) return;

    e.preventDefault();

    // Track transition state
    isTransitioning = true;
    const unsub = router.subscribe("onResolved", () => {
      unsub();
      isTransitioning = false;
    });

    router.navigate({
      ...navOptions,
      replace,
      resetScroll,
      hashScrollIntoView,
      startTransition,
      viewTransition,
      ignoreBlocker,
    } as any);
  }

  function handleMouseEnter(e: MouseEvent) {
    onmouseenter?.(e);

    if (effectivePreload === "intent") {
      preloadTimeout = setTimeout(() => {
        doPreload();
      }, effectivePreloadDelay);
    }
  }

  function handleMouseLeave(e: MouseEvent) {
    onmouseleave?.(e);

    if (preloadTimeout) {
      clearTimeout(preloadTimeout);
      preloadTimeout = undefined;
    }
  }

  function handleFocus(e: FocusEvent) {
    onfocus?.(e);

    if (effectivePreload === "intent") {
      doPreload();
    }
  }

  function handleTouchStart(e: TouchEvent) {
    ontouchstart?.(e);

    if (effectivePreload === "intent") {
      doPreload();
    }
  }
</script>

<a
  {href}
  {target}
  class={resolvedClass}
  style={resolvedStyle}
  data-status={isActive ? "active" : undefined}
  data-transitioning={isTransitioning ? "transitioning" : undefined}
  aria-current={isActive ? "page" : undefined}
  aria-disabled={disabled || undefined}
  role={disabled ? "link" : undefined}
  tabindex={disabled ? -1 : undefined}
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onfocus={handleFocus}
  ontouchstart={handleTouchStart}
  {...getSafeRestProps()}
  {...(() => { const { class: _, style: __, ...rest } = resolvedActiveProps; return rest; })()}
  {...(() => { const { class: _, style: __, ...rest } = resolvedInactiveProps; return rest; })()}
>
  {#if children}
    {@render children({ isActive, isTransitioning })}
  {/if}
</a>
