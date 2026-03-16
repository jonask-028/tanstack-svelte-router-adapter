<!--
  ScrollRestoration.svelte — Enables automatic scroll restoration.

  @deprecated Use `createRouter({ scrollRestoration: true })` instead.
  This component exists for backward compatibility.

  @example
  ```svelte
  <script>
    import { ScrollRestoration } from '@tanstack/svelte-router'
  </script>

  <ScrollRestoration />
  ```
-->
<script lang="ts">
  import { useScrollRestoration } from "../hooks/useScrollRestoration.js";
  import type { ScrollRestorationOptions } from "@tanstack/router-core";

  let _props: ScrollRestorationOptions = $props();

  if (
    typeof process !== "undefined" &&
    process.env?.NODE_ENV === "development"
  ) {
    console.warn(
      "[TanStack Router] <ScrollRestoration /> is deprecated. " +
        "Use createRouter({ scrollRestoration: true }) instead.",
    );
  }

  useScrollRestoration();
</script>
