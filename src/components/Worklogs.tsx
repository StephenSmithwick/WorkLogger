import { createResource } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { useApi } from "@/App";
import { For, Show, Suspense } from "solid-js";

type WorklogsProps = {
  day: () => string
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export default function Worklogs(props : WorklogsProps) {
  const api = useApi();

  const [worklog, { refetch: refetchWorklog }] = createResource(
    () => props.day(),
    async (day) => {
      const date = new Date(day);
      const res = await api.worklog.$get({
        query: {
          from: startOfDay(date).toISOString(),
          to: endOfDay(date).toISOString(),
        },
      });
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
          <For each={worklog()}>{(wl) => <Worklog worklog={wl} onSubmitted={refetchWorklog}/>}</For>
        </Show>
      </Suspense>
      <li class="forms">
        <WorklogForm
          labels={labels}
          onLabelsCreated={refetchLabels}
          onSubmitted={refetchWorklog}
        />
      </li>
    </ul>
  );
}
