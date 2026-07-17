import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import ssrPlugin from "vite-ssr-components/plugin";
import path from "path";

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin(), solid({ ssr: true, exclude: "src/server/**" })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: false,
  },
});
