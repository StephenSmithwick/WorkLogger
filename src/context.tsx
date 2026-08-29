import { createContext, useContext } from "solid-js";
import type { hc } from "hono/client";
import type { AppType } from "@/api";
import type { TimeAPI } from "@/TimeAPI";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export interface AppContextValue {
  api: ApiClient;
  timezone: string;
  time: TimeAPI;
}

export const AppContext = createContext<AppContextValue>();

export function context(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("context must be used within App context");
  return value;
}
