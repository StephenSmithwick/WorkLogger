import { hydrate } from "solid-js/web";
import { ContextRouter } from "@/ContextRouter";
import { ApiClient } from "@/context";
import { AppType } from "@/api";
import { hc } from "hono/client";

const client = hc<AppType>(window.location?.origin ?? "") as ApiClient;
hydrate(
  () => <ContextRouter client={client} url={window.location.pathname} />,
  document.getElementById("root")!,
);
