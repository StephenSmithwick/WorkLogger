import Worklogs from "@/components/Worklogs";
import { createContext, useContext, type ParentProps } from "solid-js";
import type { hc } from "hono/client";
import type { AppType } from "@/api";
import { renderToStringAsync } from "solid-js/web";
import { Component, createSignal } from "solid-js";

export type ApiClient = ReturnType<typeof hc<AppType>>;
const ApiContext = createContext<ApiClient>();

export const appHtml = async (client: ApiClient) => {
  return renderToStringAsync(() => <App client={client} />);
};

export function useApi(): ApiClient {
  const client = useContext(ApiContext);
  if (!client) throw new Error("useApi must be used within <App>");
  return client;
}

interface AppProps {
  client: ApiClient;
}

const App: Component<AppProps> = (props) => {
  const getUtcTodayStr = () => new Date().toISOString().split("T")[0];
  const [selectedDay, setSelectedDay] = createSignal(getUtcTodayStr());

  return (
    <ApiContext.Provider value={props.client}>
      <div class="filter">
        <input type="date"
          value={selectedDay()}
          onInput={(e) => setSelectedDay(e.currentTarget.value)}
        />
      </div>
      <Worklogs day={selectedDay}/>
    </ApiContext.Provider>
  );
};

export default App;
