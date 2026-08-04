/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono, type Context } from "hono";
import { raw } from "hono/html";
import { renderer } from "./renderer";
import { api, AppType } from "@/api";
import { hc } from "hono/client";
import { renderContextRouter } from "@/ContextRouter";

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.route("/", api);
app.use(renderer);

async function renderApp(c: Context<{ Bindings: CloudflareBindings }>) {
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

  const url = new URL(c.req.url).pathname;
  return c.render(
    <div id="root">{raw(await renderContextRouter({ client, url }))}</div>,
  );
}

export default app.get("/", renderApp).get("/:shortTimezone/:date", renderApp);
