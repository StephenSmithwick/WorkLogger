/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono } from "hono";
import { raw } from "hono/html";
import { renderer } from "./renderer";
import { api, AppType } from "@/api";
import { hc } from "hono/client";
import { appHtml } from "@/App";

const app = new Hono();
app.route("/", api);
app.use(renderer);

export default app.get("/", async (c) => {
  const apiClient = hc<AppType>("http://isServer", {
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
  console.log("Here");
  return c.render(<div id="root">{raw(await appHtml(apiClient))}</div>);
});
