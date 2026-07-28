import { createResource } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { context } from "@/App";
import { For, Show, Suspense } from "solid-js";

type WorklogsProps = {
  from: () => string;
  to: () => string;
};

export default function Worklogs({ from, to }: WorklogsProps) {
  const { api } = context();

  const [worklog, { refetch: refetchWorklog }] = createResource(
    () => ({ from: from(), to: to() }),
    async (range) => {
      const res = await api.worklog.$get({
        query: {
          from: range.from,
          to: range.to,
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
          <For each={worklog()}>
            {(wl) => <Worklog worklog={wl} onSubmitted={refetchWorklog} />}
          </For>
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
