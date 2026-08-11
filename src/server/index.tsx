/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono, type Context } from "hono";
import { raw } from "hono/html";
import { renderer } from "@/server/renderer";
import { api, AppType } from "@/api";
import { hc } from "hono/client";
import { renderContextRouter } from "@/ContextRouter";
import { googleAuthentication, jwtAuthCookie } from "@/security";

const app = new Hono<{ Bindings: CloudflareBindings }>();
app.route("/auth/google", googleAuthentication).use(jwtAuthCookie);
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
          headers: { ...init?.headers, cookie: c.req.header("cookie") ?? "" },
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

export default app.get("/", renderApp).get("/:timezone/:date", renderApp);
