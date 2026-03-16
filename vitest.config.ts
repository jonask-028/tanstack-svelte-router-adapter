import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    alias: {
      "@tanstack/svelte-router": new URL("./src", import.meta.url).pathname,
    },
    // Use browser condition so Svelte resolves to client-side bundle
    // instead of server bundle (which doesn't support mount()).
    conditions: ["browser"],
  },
  test: {
    name: "@tanstack/svelte-router",
    dir: "./tests",
    watch: false,
    environment: "jsdom",
    typecheck: { enabled: true, tsconfig: "./tsconfig.test.json" },
    setupFiles: ["./tests/setupTests.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      exclude: ["src/index.ts", "src/**/index.ts"],
      thresholds: {
        statements: 72,
        branches: 59,
        functions: 72,
      },
    },
  },
});
