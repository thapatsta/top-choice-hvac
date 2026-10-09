import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests that need the production build (`npm run build` first): they start
// `next start` and check the real HTML of the /lp/* pages.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests-built/**/*.test.ts"],
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
