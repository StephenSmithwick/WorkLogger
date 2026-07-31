import Worklogs from "@/components/Worklogs";
import { createContext, useContext, onMount } from "solid-js";
import type { hc } from "hono/client";
import type { AppType } from "@/api";
import { renderToStringAsync, Show } from "solid-js/web";
import { Component, createSignal, createMemo } from "solid-js";
import { createTimeAPI, TimeAPI } from "@/timeAPI";

export type ApiClient = ReturnType<typeof hc<AppType>>;

interface Context {
  api: ApiClient;
  timezone: string;
  time: TimeAPI;
}
const Context = createContext<Context>();

export const appHtml = async ({ client, timezone }: AppProps) => {
  return renderToStringAsync(() => <App client={client} timezone={timezone} />);
};

export function context(): Context {
  const context = useContext(Context);
  if (!context) throw new Error("context must be used within <App>");
  return context;
}

interface AppProps {
  client: ApiClient;
  timezone: undefined | string;
}

interface TimezoneAppProps extends Omit<AppProps, "timezone"> {
  timezone: string;
}

const App: Component<AppProps> = ({ client, timezone }) => {
  const [tz, setTz] = createSignal(timezone);

  onMount(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.cookie = `timezone=${timezone}; max-age=31536000; path=/`;
    setTz(timezone);
  });

  return (
    <Show when={tz()} fallback={<p>Loading Timezone</p>}>
      {(definedTimezone) => (
        <TimezoneApp client={client} timezone={definedTimezone()} />
      )}
    </Show>
  );
};

const TimezoneApp: Component<TimezoneAppProps> = ({ timezone, client }) => {
  const time = createTimeAPI(timezone);
  const [selectedDay, setSelectedDay] = createSignal(time.today());

  const from = createMemo(() =>
    new Date(selectedDay())
      .toTemporalInstant()
      .toZonedDateTimeISO(timezone)
      .toString({ timeZoneName: "never" }),
  );
  const to = createMemo(() =>
    new Date(selectedDay())
      .toTemporalInstant()
      .toZonedDateTimeISO(timezone)
      .add({ days: 1 })
      .toString({ timeZoneName: "never" }),
  );

  return (
    <Context.Provider value={{ api: client, timezone, time }}>
      <div class="filter">
        <input
          type="date"
          value={selectedDay()}
          onInput={(e) => setSelectedDay(e.currentTarget.value)}
        />
      </div>
      <Worklogs from={from} to={to} />
    </Context.Provider>
  );
};

export default App;
