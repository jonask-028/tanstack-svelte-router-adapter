<!--
  Block — Declarative navigation blocking component.

  Wraps useBlocker as a component that exposes the blocker state
  to its children via a Snippet.

  @example Modern API (recommended):
  ```svelte
  <script lang="ts">
    import { Block } from '@tanstack/svelte-router'
    let formDirty = $state(false)
  </script>

  <Block shouldBlockFn={() => formDirty} withResolver={true}>
    {#snippet children({ status, proceed, reset })}
      {#if status === 'blocked'}
        <dialog open>
          <p>Leave page? Unsaved changes will be lost.</p>
          <button onclick={proceed}>Leave</button>
          <button onclick={reset}>Stay</button>
        </dialog>
      {/if}
    {/snippet}
  </Block>
  ```

  @example Legacy API (deprecated):
  ```svelte
  <Block condition={formDirty}>
    ...
  </Block>
  ```
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    useBlocker,
    type BlockerResolver,
    type UseBlockerOpts,
    type ShouldBlockFn,
  } from "../hooks/useBlocker.svelte.js";

  // Accept both modern and legacy props
  let {
    // Modern API
    shouldBlockFn,
    disabled,
    enableBeforeUnload,
    withResolver,
    // Legacy API (deprecated)
    condition,
    blockerFn,
    // Children
    children,
  }: {
    shouldBlockFn?: ShouldBlockFn;
    disabled?: boolean;
    enableBeforeUnload?: boolean | (() => boolean);
    withResolver?: boolean;
    /** @deprecated Use shouldBlockFn instead */
    condition?: boolean;
    /** @deprecated Use shouldBlockFn instead */
    blockerFn?: () => Promise<any> | any;
    children?: Snippet<[BlockerResolver]>;
  } = $props();

  // Resolve to the correct opts format
  let blockerOpts = $derived.by((): UseBlockerOpts => {
    if (shouldBlockFn) {
      return {
        shouldBlockFn,
        disabled,
        enableBeforeUnload,
        withResolver: withResolver ?? true,
      };
    }
    // Legacy: convert condition/blockerFn to modern API
    return {
      shouldBlockFn: () => Boolean(condition ?? true),
      enableBeforeUnload: Boolean(condition ?? true),
      withResolver: blockerFn === undefined,
      disabled: !condition,
    };
  });

  let blocker = $derived(useBlocker(blockerOpts));
</script>

{#if children}
  {@render children(blocker as BlockerResolver)}
{/if}
