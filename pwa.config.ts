import type { GenerateSWOptions } from "workbox-build";

export const workboxOptions = {
  clientsClaim: true,
  globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/(worklog|label)/,
      handler: "NetworkFirst",
      options: {
        cacheName: "hono-rpc-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 3,
        },
        cacheableResponse: {
          statuses: [200],
        },
      },
    },
  ],
} satisfies Pick<
  GenerateSWOptions,
  "clientsClaim" | "globPatterns" | "runtimeCaching" | "skipWaiting"
>;
