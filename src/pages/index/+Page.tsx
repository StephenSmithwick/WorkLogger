import { createResource, createSignal } from "solid-js"
import { useMetadata } from "vike-metadata-solid"
import { honoClient } from "@/lib/hono-client"
import getTitle from "@/utils/get-title"

export default function Page() {
  useMetadata({
    title: getTitle("Home"),
  })

  const [data] = createResource(async () => {
    const res = await honoClient.worklog.$get()
    return res.json()
  }, { initialValue: [] })

  return (
    <>
      <div>
        <ul>
          {data.loading
            ? <li>Loading...</li>
            : data.error
              ? <li>{`Error: ${data.error.message}`}</li>
              : data().map(wl => <li><ul>
                <li class="time">{wl.time}</li>
                <li class="duration">{wl.duration}</li>
                <li class="name">{wl.name}</li>
                <li class="notes">{wl.notes}</li>
                <li class="labels">{wl.labels.map(label => <span>{label.name}</span>)}</li>
              </ul></li>)}
        </ul>
      </div>
    </>
  )
}
