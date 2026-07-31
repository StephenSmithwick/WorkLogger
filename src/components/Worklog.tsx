import { DeleteWorklog } from "@/components/DeleteWorklog";
import { For } from "solid-js";
import { WorklogResponse } from "@/api";

interface WorklogProps {
  worklog: WorklogResponse;
  onDeleted: () => void;
  onEdit: () => void;
  editing: boolean;
}

export const Worklog = (props: WorklogProps) => {
  const date = new Date(props.worklog.time);
  return (
    <ul class="worklog" classList={{ editing: props.editing }}>
      <li class="name">
        <button class="edit" onClick={props.onEdit}>
          {props.editing ? "✕" : "✎"}
        </button>
        {props.worklog.name}
      </li>
      <li class="notes">{props.worklog.notes}</li>
      <li class="duration">{props.worklog.duration}</li>
      <li class="time">
        {date.toLocaleDateString()} {date.toLocaleTimeString()}
      </li>
      <li class="labels">
        <For each={props.worklog.labels}>
          {(label) => <span>{label.name}</span>}
        </For>
      </li>
      <li>
        <DeleteWorklog id={props.worklog.id} onDeleted={props.onDeleted} />
      </li>
    </ul>
  );
};
