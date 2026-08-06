import Worklogs from "@/components/Worklogs";
import { Component, createMemo } from "solid-js";

export interface AppProps {
  timezone: string;
  selectedDay: () => string;
  onSelectedDayChange: (date: string) => void;
}

const App: Component<AppProps> = ({
  timezone,
  selectedDay,
  onSelectedDayChange,
}) => {
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
    <>
      <div class="filter">
        <input
          type="date"
          value={selectedDay()}
          onInput={(e) => onSelectedDayChange(e.currentTarget.value)}
        />
      </div>
      <Worklogs from={from} to={to} />
    </>
  );
};

export default App;
