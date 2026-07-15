import { createResource } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { useApi } from "@/App";
import { For, Show, Suspense } from "solid-js";
import { isServer } from "solid-js/web";

interface WorklogProps {
  worklog: {
    time: string;
    duration: string;
    name: string;
    notes: string;
    labels: { name: string }[];
  };
}
function Worklog({ worklog: wl }: WorklogProps) {
  return (
    <li>
      <ul>
        <li class="time">{wl.time}</li>
        <li class="duration">{wl.duration}</li>
        <li class="name">{wl.name}</li>
        <li class="notes">{wl.notes}</li>
        <li class="labels">
          <For each={wl.labels}>{(label) => <span>{label.name}</span>}</For>
        </li>
        {isServer ? <li>Server</li> : <li>Browser</li>}
      </ul>
    </li>
  );
}

export default function Worklogs() {
  const api = useApi();
  const [worklog, { refetch: refetchWorklog }] = createResource(
    async () => {
      const res = await api.worklog.$get();
      return res.json();
    },
    { initialValue: [] },
  );
  const [labels, { refetch: refetchLabels }] = createResource(
    async () => {
      const res = await api.label.$get();
      return res.json();
    },
    { initialValue: [] },
  );
  return (
    <ul>
      <Suspense fallback={<li>Loading...</li>}>
        <Show
          when={!worklog.error}
          fallback={<li>{`Error: ${worklog.error?.message}`}</li>}
        >
          <For each={worklog()}>{(wl) => <Worklog worklog={wl} />}</For>
        </Show>
      </Suspense>
      <li>
        <WorklogForm
          labels={labels}
          onLabelsCreated={refetchLabels}
          onSubmitted={refetchWorklog}
        />
      </li>
    </ul>
  );
}
