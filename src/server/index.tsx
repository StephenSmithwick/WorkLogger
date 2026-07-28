/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono } from "hono";
import { raw } from "hono/html";
import { renderer } from "./renderer";
import { api, AppType } from "@/api";
import { hc } from "hono/client";
import { appHtml } from "@/App";
import { getCookie } from "hono/cookie";

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.route("/", api);
app.use(renderer);

export default app.get("/", async (c) => {
  const client = hc<AppType>("http://isServer", {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) =>
      api.request(
        input,
        {
          ...init,
          cache: "no-store",
        },
        c.env,
        c.executionCtx,
      ),
  });
  const timezone = getCookie(c, "timezone");
  return c.render(
    <div id="root">{raw(await appHtml({ timezone, client }))}</div>,
  );
});
