<!--
  HeadContent.svelte — Renders all route-managed head tags (title, meta, links,
  styles, head scripts) into <svelte:head>.

  Place this component in your root layout to enable automatic document head
  management based on route `meta`, `links`, `styles`, and `headScripts` options.

  @example
  ```svelte
  <script>
    import { HeadContent } from '@tanstack/svelte-router'
  </script>

  <HeadContent />
  ```
-->
<script lang="ts">
  import { useTags } from "../hooks/useTags.js";
  import { useRouter } from "../hooks/useRouter.js";
  import Asset from "./Asset.svelte";

  let tags = $derived(useTags());
  const router = useRouter();
  const nonce = (router.options as any).ssr?.nonce as string | undefined;
</script>

<svelte:head>
  {#each tags as tag (JSON.stringify(tag))}
    <Asset {...tag} {nonce} />
  {/each}
</svelte:head>
