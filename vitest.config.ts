// import { mergeConfig } from "vitest/config";
// import { viteConfig } from "./vite.config";
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";

export default defineConfig({
  plugins: [solid({ ssr: false })],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },

  test: {
    include: ["src/**/*.test.tsx"],

    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }],
    },
  },
});
