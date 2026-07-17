import { DeleteWorklog } from "@/components/DeleteWorklog";
import { For } from "solid-js";

interface WorklogProps {
  worklog: {
    time: string;
    duration: string;
    name: string;
    notes: string;
    labels: { name: string }[];
  };
  onSubmitted: () => void;
}

export const Worklog = ({ worklog: wl, onSubmitted }: WorklogProps) => {
  return (
    <li>
      <ul class="worklog">
        <li class="time">{wl.time}</li>
        <li class="duration">{wl.duration}</li>
        <li class="name">{wl.name}</li>
        <li class="notes">{wl.notes}</li>
        <li class="labels">
          <For each={wl.labels}>{(label) => <span>{label.name}</span>}</For>
        </li>
        <li><DeleteWorklog id={wl.id} onSubmitted={onSubmitted}></DeleteWorklog></li>
      </ul>
    </li>
  );
}
