import { DeleteWorklog } from "@/components/DeleteWorklog";
import { For } from "solid-js";
import { WorklogResponse } from "@/api";

interface WorklogProps {
  worklog: WorklogResponse;
  onDeleted: () => void;
  onSelect: () => void;
}

export const Worklog = ({ worklog, onDeleted, onSelect }: WorklogProps) => {
  const date = new Date(worklog.time);
  return (
    <li>
      <ul class="worklog">
        <li class="name">
          <button class="select" onClick={onSelect}>
            ✎
          </button>
          {worklog.name}
        </li>
        <li class="notes">{worklog.notes}</li>
        <li class="duration">{worklog.duration}</li>
        <li class="time">
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </li>
        <li class="labels">
          <For each={worklog.labels}>
            {(label) => <span>{label.name}</span>}
          </For>
        </li>
        <li>
          <DeleteWorklog id={worklog.id} onDeleted={onDeleted}></DeleteWorklog>
        </li>
      </ul>
    </li>
  );
};
