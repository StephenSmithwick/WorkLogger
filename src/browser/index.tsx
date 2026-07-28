import { hydrate } from "solid-js/web";
import { onMount } from "solid-js";
import App, { ApiClient } from "@/App";
import { AppType } from "@/api";
import { hc } from "hono/client";

const match = document.cookie.match(/(^|;) ?timezone=([^;]*)(;|$)/);
const timezone = match ? decodeURIComponent(match[2]) : undefined;

const client = hc<AppType>(window.location?.origin ?? "") as ApiClient;
hydrate(
  () => <App client={client} timezone={timezone} />,
  document.getElementById("root")!,
);
