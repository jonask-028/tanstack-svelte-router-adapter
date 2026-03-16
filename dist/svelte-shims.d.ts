/**
 * Ambient type declarations for Svelte components.
 * Allows TypeScript to resolve `.svelte` file imports.
 */
declare module "*.svelte" {
  import type { Component } from "svelte";
  const component: Component<any>;
  export default component;
}
