import { createResource, createSignal } from "solid-js";
import { WorklogForm } from "@/components/WorklogForm";
import { Worklog } from "@/components/Worklog";
import { context } from "@/context";
import { For, Show, Suspense } from "solid-js";
import { WorklogResponse } from "@/api";

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

  const [editingWorklog, setEditingWorklog] = createSignal<WorklogResponse>();
  const [formExpanded, setFormExpanded] = createSignal(false);

  function edit(wl: WorklogResponse) {
    return () => {
      setFormExpanded(true);
      if (wl.id === editingWorklog()?.id) {
        setEditingWorklog(undefined);
      } else {
        setEditingWorklog(wl);
      }
    };
  }

  function worklogFormSubmit() {
    setFormExpanded(false);
    setEditingWorklog(undefined);
    refetchWorklog();
  }

  return (
    <ul>
      <Suspense fallback={<li>Loading...</li>}>
        <Show
          when={!worklog.error}
          fallback={<li>{`Error: ${worklog.error?.message}`}</li>}
        >
          <For each={worklog()}>
            {(wl) => (
              <li>
                <Worklog
                  worklog={wl}
                  onDeleted={refetchWorklog}
                  onEdit={edit(wl)}
                  editing={wl.id === editingWorklog()?.id}
                />
              </li>
            )}
          </For>
        </Show>
      </Suspense>
      <li class="forms">
        <WorklogForm
          worklog={editingWorklog}
          labels={labels}
          onLabelsCreated={refetchLabels}
          onSubmitted={worklogFormSubmit}
          expanded={formExpanded}
          setExpanded={setFormExpanded}
        />
      </li>
    </ul>
  );
}
