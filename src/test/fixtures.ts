import type { WorklogData } from "@/api";

export function testWorklog(overrides: Partial<WorklogData> = {}): WorklogData {
  return {
    id: 1,
    duration: "1 hour",
    time: "2026-08-25T04:00",
    name: "Test work",
    notes: "",
    labels: [],
    ...overrides,
  };
}

export const jsonResponse = (json: any) => new Response(JSON.stringify(json));
