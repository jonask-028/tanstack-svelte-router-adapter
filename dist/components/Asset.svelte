<!--
  Asset.svelte — Renders a single RouterManagedTag as the correct HTML element.

  Handles: title, meta, link, style, script.
  Script tags are injected imperatively via onMount to avoid Svelte's restriction
  on <script> tags in templates.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { RouterManagedTag } from "@tanstack/router-core";

  let { tag, attrs, children, nonce }: RouterManagedTag & { nonce?: string } =
    $props();

  let scriptEl: HTMLScriptElement | undefined;

  // Merge nonce into attrs for link/style elements (nonce is valid HTML but not in Svelte's types)
  let linkAttrs = $derived({ ...attrs, nonce: nonce || undefined } as Record<
    string,
    unknown
  >);
  let styleAttrs = $derived({ ...attrs, nonce: nonce || undefined } as Record<
    string,
    unknown
  >);

  // For non-data scripts, inject imperatively
  let isDataScript = $derived(
    tag === "script" &&
      typeof attrs?.type === "string" &&
      attrs.type !== "" &&
      attrs.type !== "text/javascript" &&
      attrs.type !== "module",
  );

  onMount(() => {
    // Read current prop values inside onMount closure.
    // Asset is keyed in HeadContent so props don't change after mount,
    // but we use locals to avoid Svelte's state_referenced_locally warning.
    const currentTag = tag;
    const currentAttrs = attrs;
    const currentChildren = children;

    if (currentTag !== "script" || isDataScript) return;

    const attrRecord = (currentAttrs ?? {}) as Record<string, any>;

    if (attrRecord.src) {
      // Check for existing script with same src
      const normSrc = (() => {
        try {
          const base = document.baseURI || window.location.href;
          return new URL(attrRecord.src, base).href;
        } catch {
          return attrRecord.src;
        }
      })();
      const existing = Array.from(
        document.querySelectorAll("script[src]"),
      ).find((el) => (el as HTMLScriptElement).src === normSrc);

      if (existing) return;

      const script = document.createElement("script");
      for (const [key, value] of Object.entries(attrRecord)) {
        if (value !== undefined && value !== false) {
          script.setAttribute(
            key,
            typeof value === "boolean" ? "" : String(value),
          );
        }
      }
      document.head.appendChild(script);
      scriptEl = script;
    } else if (typeof currentChildren === "string") {
      // Inline script
      const typeAttr =
        typeof attrRecord.type === "string"
          ? attrRecord.type
          : "text/javascript";
      const nonceAttr =
        typeof attrRecord.nonce === "string" ? attrRecord.nonce : undefined;

      const existing = Array.from(
        document.querySelectorAll("script:not([src])"),
      ).find((el) => {
        if (!(el instanceof HTMLScriptElement)) return false;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? undefined;
        return (
          el.textContent === currentChildren &&
          sType === typeAttr &&
          sNonce === nonceAttr
        );
      });

      if (existing) return;

      const script = document.createElement("script");
      script.textContent = currentChildren;
      for (const [key, value] of Object.entries(attrRecord)) {
        if (value !== undefined && value !== false) {
          script.setAttribute(
            key,
            typeof value === "boolean" ? "" : String(value),
          );
        }
      }
      document.head.appendChild(script);
      scriptEl = script;
    }

    return () => {
      if (scriptEl?.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  });
</script>

{#if tag === "title"}
  <title {...attrs}>{children}</title>
{:else if tag === "meta"}
  <meta {...attrs} />
{:else if tag === "link"}
  <link {...linkAttrs} />
{:else if tag === "style"}
  <style {...styleAttrs}>
{@html children}
  </style>
{:else if tag === "script" && isDataScript && typeof children === "string"}
  <!-- Data scripts (e.g. application/ld+json) rendered directly -->
  <script {...attrs}>
{@html children}
  </script>
{/if}
