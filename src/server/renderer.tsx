/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { jsxRenderer } from "hono/jsx-renderer";
import { raw } from "hono/html";
import { generateHydrationScript } from "solid-js/web";
import { Script, ViteClient, Link } from "vite-ssr-components/hono";

export const renderer = jsxRenderer(({ children }) => (
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Worklogger</title>
      {raw(generateHydrationScript())}
      <ViteClient />
      <Link href="/src/style.css" rel="stylesheet" />
    </head>
    <body>
      {children}
      <Script src="/src/browser/index.tsx" />
    </body>
  </html>
));
