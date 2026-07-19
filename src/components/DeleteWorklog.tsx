import { useApi } from "@/App";

export function DeleteWorklog(props: {
  id: number,
  onSubmitted: () => void;
}) {
  const api = useApi();

  const deleteWorklog = async (id: number) => {
    console.log("Deleting", { id });
    const res = await api.worklog.$delete({ json: {id} });
    if (!res.ok) throw new Error("Failed to delete worklog entry");
    props.onSubmitted();
    return await res.json();
  };

  return <button class="delete" onClick={() => deleteWorklog(props.id)}>☒</button>;
}
