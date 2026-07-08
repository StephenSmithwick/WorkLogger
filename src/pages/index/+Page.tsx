import { createResource, createSignal } from "solid-js"
import { useMetadata } from "vike-metadata-solid"
import { honoClient } from "@/lib/hono-client"
import getTitle from "@/utils/get-title"
import { createStore } from "solid-js/store";
import { Select, createOptions } from "@thisbeyond/solid-select";


export default function Page() {
  useMetadata({
    title: getTitle("Home"),
  })

  const [worklog, { refetch: refetchWorklog }] = createResource(async () => {
    const res = await honoClient.worklog.$get()
    return res.json()
  }, { initialValue: [] })

  const [labels, { refetch: refetchLabels }] = createResource(async () => {
    const res = await honoClient.label.$get();
    return res.json();
  }, { initialValue: [] });

  return (
    <>
      <div>
        <ul>
          {worklog.loading
            ? <li>Loading...</li>
            : worklog.error
              ? <li>{`Error: ${worklog.error.message}`}</li>
              : worklog().map(wl => <li><ul>
                <li class="time">{wl.time}</li>
                <li class="duration">{wl.duration}</li>
                <li class="name">{wl.name}</li>
                <li class="notes">{wl.notes}</li>
                <li class="labels">{wl.labels.map(label => <span>{label.name}</span>)}</li>
              </ul></li>)}
        </ul>
        <Form
          labels={labels}
          onLabelsCreated={refetchLabels}
          onSubmitted={refetchWorklog}
        />
      </div>
    </>
  )
}

function Form(props: {
  labels: () => { id: number; name: string }[];
  onLabelsCreated: () => void;
  onSubmitted: () => void;
}) {
  const [form, setForm] = createStore({
    time: "",
    duration: "",
    name: "",
    notes: "",
    labels: [] as string[],
  });
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [resetKey, setResetKey] = createSignal(0); // see note below on why

  const selectProps = createOptions(
    () => props.labels().map(l => l),
    {
      extractText: (label) => label.name,
      createable: (name) => ({ name }),
      format: (label) => (
          <span>{label.name}</span>
        )
    }
  );

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await honoClient.worklog.$post({
        json: form
      });
      if (!res.ok) throw new Error("Failed to save worklog entry");

      setForm({ time: "", duration: "", name: "", notes: "", labels: [] });
      setResetKey(k => k + 1); // force Select to remount and drop its internal selection
      props.onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Log Work</h1>
      {error() && <p class="error">{error()}</p>}
      <ul>
        <li class="time">
          <input
            type="datetime-local"
            value={form.time}
            onInput={e => setForm("time", e.currentTarget.value)}
          />
        </li>
        <li class="duration">
          <input
            type="text"
            value={form.duration}
            onInput={e => setForm("duration", e.currentTarget.value)}
          />
        </li>
        <li class="name">
          <input
            value={form.name}
            onInput={e => setForm("name", e.currentTarget.value)}
          />
        </li>
        <li class="notes">
          <textarea
            rows="5" cols="40"
            placeholder="Notes..."
            onInput={e => setForm("notes", e.currentTarget.value)}
          >{form.notes}</textarea>
        </li>
        <li class="labels">
          <Select
            multiple
            {...selectProps}
            onChange={(selected: string[]) => setForm("labels", selected)}
          />
        </li>
      </ul>

      <button type="submit" disabled={submitting()}>
        {submitting() ? "Saving..." : "Submit"}
      </button>
    </form>
  );
}
