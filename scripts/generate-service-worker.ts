import { generateSW } from "workbox-build";
import path from "node:path";
import { workboxOptions } from "../pwa.config";

const outputDirectory = path.resolve("dist/client");
const { count, size, warnings } = await generateSW({
  globDirectory: outputDirectory,
  swDest: path.join(outputDirectory, "sw.js"),
  ...workboxOptions,
});

if (warnings.length > 0) {
  throw new Error(warnings.join("\n"));
}

console.log(`Generated service worker with ${count} precached files (${size} bytes).`);
