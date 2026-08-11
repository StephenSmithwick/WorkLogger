/** @jsxImportSource hono/jsx */
/** @jsxRuntime automatic */
import { Hono, type Context } from "hono";
import { raw } from "hono/html";
import { renderer } from "@/server/renderer";
import { api, AppType } from "@/api";
import { hc } from "hono/client";
import { renderContextRouter } from "@/ContextRouter";
import {
  googleAuthentication,
  requireAuthPage,
  requireAuthCookie,
} from "@/security";

const client = (c: Context) =>
  hc<AppType>("http://isServer", {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) =>
      api.request(
        input,
        {
          ...init,
          cache: "no-store",
          headers: {
            ...init?.headers,
            cookie: c.req.header("cookie") ?? "",
          },
        },
        c.env,
        c.executionCtx,
      ),
  });

const url = (c: Context) => new URL(c.req.url).pathname;
const renderRoot = async (c: Context) =>
  c.render(
    <div id="root">
      {raw(await renderContextRouter({ client: client(c), url: url(c) }))}
    </div>,
  );

const app = new Hono<{ Bindings: CloudflareBindings }>();

export default app
  .route("/", googleAuthentication)
  .use(renderer)
  .get("/", renderRoot)
  .use("/", requireAuthPage)
  .get("/:timezone/:date", renderRoot)
  .use("/:timezone/:date", requireAuthPage)
  .route("/", api);
