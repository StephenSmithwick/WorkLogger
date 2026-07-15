/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { jsxRenderer } from "hono/jsx-renderer";
import { raw } from "hono/html";
import { generateHydrationScript } from "solid-js/web";
import { Script, ViteClient } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Worklogger</title>
      {raw(generateHydrationScript())}
      <ViteClient />
    </head>
    <body>
      {children}
      <Script src="/src/browser/index.tsx" />
    </body>
  </html>
));
