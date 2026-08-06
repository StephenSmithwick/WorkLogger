import { hydrate } from "solid-js/web";
import { ContextRouter } from "@/ContextRouter";
import { ApiClient } from "@/context";
import { AppType } from "@/api";
import { hc } from "hono/client";

const client = hc<AppType>(window.location?.origin ?? "") as ApiClient;

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js");
  });
}

hydrate(
  () => <ContextRouter client={client} url={window.location.pathname} />,
  document.getElementById("root")!,
);
