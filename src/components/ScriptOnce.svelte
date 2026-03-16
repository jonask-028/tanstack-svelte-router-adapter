<!--
  ScriptOnce.svelte — SSR-only helper to emit a <script> tag exactly once.

  On the server, renders a script with `document.currentScript.remove()` appended
  so it self-removes after execution. On the client, renders nothing.

  @example
  ```svelte
  <script>
    import { ScriptOnce } from '@tanstack/svelte-router'
  </script>

  <ScriptOnce children="console.log('runs once during SSR')" />
  ```
-->
<script lang="ts">
  import { useRouter } from "../hooks/useRouter.js";

  let { children }: { children: string } = $props();

  const router = useRouter();
  const isServer = router.isServer;
  const nonce = (router.options as any).ssr?.nonce as string | undefined;
</script>

{#if isServer}
  {@html `<script${nonce ? ` nonce="${nonce}"` : ""}>${children};document.currentScript.remove()</script>`}
{/if}
