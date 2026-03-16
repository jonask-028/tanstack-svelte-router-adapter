<!--
  Scripts.svelte — Renders body script tags collected from route matches
  and SSR manifests.

  Place near the end of your document body (in your root layout or app shell).

  @example
  ```svelte
  <script>
    import { Scripts } from '@tanstack/svelte-router'
  </script>

  <Scripts />
  ```
-->
<script lang="ts">
  import { useRouter } from "../hooks/useRouter.js";
  import { useRouterState } from "../hooks/useRouterState.js";
  import Asset from "./Asset.svelte";
  import type { RouterManagedTag } from "@tanstack/router-core";

  const router = useRouter();
  const nonce = (router.options as any).ssr?.nonce as string | undefined;

  // Asset scripts from the Vite manifest
  const assetScripts = useRouterState({
    select: (state: any) => {
      const result: Array<RouterManagedTag> = [];
      const manifest = (router as any).ssr?.manifest;
      if (!manifest) return result;

      state.matches
        .map((match: any) => (router as any).looseRoutesById[match.routeId]!)
        .forEach((route: any) =>
          manifest.routes?.[route.id]?.assets
            ?.filter((d: any) => d.tag === "script")
            .forEach((asset: any) => {
              result.push({
                tag: "script",
                attrs: { ...asset.attrs, nonce },
                children: asset.children,
              } as any);
            }),
        );

      return result;
    },
  }) as Array<RouterManagedTag>;

  // Route-level scripts
  const scripts = useRouterState({
    select: (state: any) => ({
      scripts: (
        state.matches
          .map((match: any) => match.scripts!)
          .flat(1)
          .filter(Boolean) as Array<any>
      ).map(({ children, ...script }: any) => ({
        tag: "script" as const,
        attrs: { ...script, nonce },
        children,
      })),
    }),
  }) as { scripts: Array<RouterManagedTag> };

  // SSR buffered scripts
  let serverBufferedScript: RouterManagedTag | undefined;
  if ((router as any).serverSsr) {
    serverBufferedScript = (router as any).serverSsr.takeBufferedScripts();
  }

  const allScripts = [...scripts.scripts, ...assetScripts];
  if (serverBufferedScript) {
    allScripts.unshift(serverBufferedScript);
  }
</script>

{#each allScripts as asset, i (i)}
  <Asset {...asset} />
{/each}
