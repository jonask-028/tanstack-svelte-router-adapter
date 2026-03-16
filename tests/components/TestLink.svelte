<!--
  Test wrapper — Renders a Link inside router context.
  Props are forwarded to the Link component.
-->
<script lang="ts">
  import type { AnyRouter } from "@tanstack/router-core";
  import ContextWrapper from "./ContextWrapper.svelte";
  import Link from "../../src/components/Link.svelte";

  let {
    router,
    to,
    from,
    params,
    search,
    hash,
    state,
    mask,
    replace,
    resetScroll,
    viewTransition,
    reloadDocument,
    preload,
    preloadDelay,
    disabled,
    activeProps,
    inactiveProps,
    activeOptions,
    target,
    linkText = "Link",
    class: className,
    style,
    onclick,
  }: {
    router: AnyRouter;
    to: string;
    from?: string;
    params?: Record<string, string>;
    search?: Record<string, unknown>;
    hash?: string;
    state?: Record<string, unknown>;
    mask?: any;
    replace?: boolean;
    resetScroll?: boolean;
    viewTransition?: boolean;
    reloadDocument?: boolean;
    preload?: "intent" | "render" | "viewport" | false;
    preloadDelay?: number;
    disabled?: boolean;
    activeProps?: Record<string, any>;
    inactiveProps?: Record<string, any>;
    activeOptions?: {
      exact?: boolean;
      includeSearch?: boolean;
      includeHash?: boolean;
    };
    target?: string;
    linkText?: string;
    class?: string;
    style?: string | Record<string, string>;
    onclick?: (e: MouseEvent) => void;
  } = $props();
</script>

<ContextWrapper {router}>
  <Link
    {to}
    {from}
    {params}
    {search}
    {hash}
    {state}
    {mask}
    {replace}
    {resetScroll}
    {viewTransition}
    {reloadDocument}
    {preload}
    {preloadDelay}
    {disabled}
    {activeProps}
    {inactiveProps}
    {activeOptions}
    {target}
    class={className}
    {style}
    {onclick}
  >
    {#snippet children({ isActive, isTransitioning })}
      <span
        data-testid="link-text"
        data-active={isActive}
        data-transitioning={isTransitioning}>{linkText}</span
      >
    {/snippet}
  </Link>
</ContextWrapper>
