import { createSignal, createEffect, onMount, Show } from "solid-js";
import { context } from "@/context";
import { createStore } from "solid-js/store";
import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { WorklogResponse, Label } from "@/api";

interface WorkLogFormProps {
  worklog: () => undefined | WorklogResponse;
  labels: () => Label[];
  onLabelsCreated: () => void;
  onSubmitted: () => void;
  expanded: () => boolean;
  setExpanded: (_: boolean) => void;
}

export function WorklogForm(props: WorkLogFormProps) {
  const { api, time } = context();

  const defaultState = (): WorklogResponse => ({
    id: NaN,
    time: time.now(),
    duration: "1 hour",
    name: "",
    notes: "",
    labels: [],
  });

  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const { expanded, setExpanded } = props;
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [state, setState] = createStore<WorklogResponse>(defaultState());

  createEffect(() => {
    const { time: propTime } = props.worklog() ?? { time: undefined };
    const { time: defaultTime } = defaultState();
    setState({
      ...defaultState(),
      ...props.worklog(),
      time: propTime ? time.toLocalTime(propTime) : defaultTime,
    });
  });

  const selectProps = createOptions(() => props.labels().map((l) => l), {
    extractText: (label: Label) => label.name,
    createable: (name: string, exists: boolean) =>
      exists ? undefined : { name },
    format: (label: Label) => <span>{label.name}</span>,
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.worklog.$post({
        json: {
          ...state,
          time: time.toISOTime(state.time),
        },
      });
      if (!res.ok) throw new Error("Failed to save worklog entry");

      setState(defaultState());
      props.onSubmitted();
    } catch (err) {
      // TODO: Can probably recreate this using an <ErrorBoundary>
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error() && <p class="error">{error()}</p>}
      <ul class="worklogForm" classList={{ expanded: expanded() }}>
        <li class="name expandable">
          <input
            value={state.name}
            onInput={(e) => setState("name", e.currentTarget.value)}
          />
        </li>
        <li class="time expandable">
          <input
            type="datetime-local"
            value={state.time}
            onInput={(e) =>
              setState("time", time.toISOTime(e.currentTarget.value))
            }
          />
        </li>
        <li class="duration expandable">
          <input
            type="text"
            value={state.duration ?? ""}
            onInput={(e) => setState("duration", e.currentTarget.value)}
          />
        </li>
        <li class="notes expandable">
          <textarea
            rows="5"
            cols="40"
            placeholder="Notes..."
            onInput={(e) => setState("notes", e.currentTarget.value)}
            value={state.notes ?? ""}
          />
        </li>
        <li class="labels expandable">
          <Show when={mounted()}>
            <Select
              multiple
              {...selectProps}
              initialValue={state.labels}
              onChange={(selected: Label[]) => setState("labels", selected)}
            />
          </Show>
        </li>
        <li class="action">
          <button type="submit" disabled={submitting()}>
            {submitting() ? "Saving..." : "Log Work"}
          </button>
          <button
            type="button"
            class="expand"
            onclick={() => setExpanded((prev) => !prev)}
          >
            {expanded() ? "↓" : "Log Work ↑"}
          </button>
        </li>
      </ul>
    </form>
  );
}
