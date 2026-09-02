import type { WorklogData } from "@/api";

export function testWorklog(overrides: Partial<WorklogData> = {}): WorklogData {
  return {
    id: 1,
    duration: "1 hour",
    time: "2026-09-02T11:30:00.000Z",
    name: "Test work",
    notes: "",
    labels: [],
    ...overrides,
  };
}

export const jsonResponse = (json: any) => new Response(JSON.stringify(json));
