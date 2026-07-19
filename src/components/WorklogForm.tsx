import { createSignal, onMount, Show } from "solid-js";
import { useApi } from "@/App";
import { createStore } from "solid-js/store";
import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";

interface WorkLogFormProps {
  labels: () => { id: number; name: string }[];
  onLabelsCreated: () => void;
  onSubmitted: () => void;
}
export function WorklogForm(props: WorkLogFormProps) {
  const api = useApi();

  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const [form, setForm] = createStore({
    time: "",
    duration: "",
    name: "",
    notes: "",
    labels: [] as string[],
  });
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const selectProps = createOptions(() => props.labels().map((l) => l), {
    extractText: (label) => label.name,
    createable: (name) => ({ name }),
    format: (label) => <span>{label.name}</span>,
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.worklog.$post({
        json: form,
      });
      if (!res.ok) throw new Error("Failed to save worklog entry");

      setForm({ time: "", duration: "", name: "", notes: "", labels: [] });
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
      <ul class="worklogForm">
        <li class="name">
          <input
            value={form.name}
            onInput={(e) => setForm("name", e.currentTarget.value)}
          />
        </li>
        <li class="notes">
          <textarea
            rows="5"
            cols="40"
            placeholder="Notes..."
            onInput={(e) => setForm("notes", e.currentTarget.value)}
          >
            {form.notes}
          </textarea>
        </li>
        <li class="time">
          <input
            type="datetime-local"
            value={form.time}
            onInput={(e) => setForm("time", new Date(e.currentTarget.value).toISOString())}
          />
        </li>
        <li class="duration">
          <input
            type="text"
            value={form.duration}
            onInput={(e) => setForm("duration", e.currentTarget.value)}
          />
        </li>
        <li class="labels">
          <Show when={mounted()}>
            <Select
              multiple
              {...selectProps}
              onChange={(selected: string[]) => setForm("labels", selected)}
            />
          </Show>
        </li>
        <li><button type="submit" disabled={submitting()}>
          {submitting() ? "Saving..." : "Log Work"}
        </button></li>
      </ul>


    </form>
  );
}
