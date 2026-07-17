import { createResource } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { useApi } from "@/App";
import { For, Show, Suspense } from "solid-js";

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
          <For each={worklog()}>{(wl) => <Worklog worklog={wl} onSubmitted={refetchWorklog}/>}</For>
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
