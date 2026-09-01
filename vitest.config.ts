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
    setupFiles: ["src/test/setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "server",
          include: ["src/**/*.test.ts"],
        },
      },

      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx"],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
