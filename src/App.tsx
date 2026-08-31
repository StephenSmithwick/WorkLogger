import { Worklogs } from "@/components/Worklogs";
import { Component, createMemo } from "solid-js";
import { context } from "@/context";

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
  const { time } = context();

  const from = createMemo(() => time.toAPITime(selectedDay()));
  const to = createMemo(() => time.toAPITime(selectedDay(), { days: 1 }));

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
