import { hydrate } from "solid-js/web";
import App, { ApiClient } from "@/App";
import { AppType } from "@/api";
import { hc } from "hono/client";

const client = hc<AppType>(window.location?.origin ?? "") as ApiClient;
hydrate(() => <App client={client} />, document.getElementById("root")!);
