import { expect, test, vi } from "vitest";
import { fireEvent, render } from "@solidjs/testing-library";
import { AppContext } from "@/context";
import { WorklogForm } from "./WorklogForm";
import { TestTimeAPI } from "@/test/TimeAPI";
import { testWorklog } from "@/test/fixtures";

interface WorklogView {
  id: string;
  duration: string;
  time: string;
  name: string;
  notes: string;
  labels: string[];
}

function readWorklog(container: HTMLElement): WorklogView {
  const input = (key: string) =>
    container.querySelector<HTMLInputElement>(`input[name="${key}"]`)!.value;
  const text = (key: string) =>
    container.querySelector<HTMLTextAreaElement>(`textarea[name="${key}"]`)!
      .value;
  const solidSelect = (key: string) =>
    [
      ...container.querySelectorAll<HTMLSpanElement>(
        `li.${key} .solid-select-multi-value > span`,
      ),
    ].map((span) => span.textContent);
  return {
    id: input("id"),
    duration: input("duration"),
    time: input("time"),
    name: input("name"),
    notes: text("notes"),
    labels: solidSelect("labels"),
  };
}

function setInput(container: HTMLElement, name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  )!;

  input.value = value;
  fireEvent.change(input);
}

function setTextArea(container: HTMLElement, name: string, value: string) {
  const textarea = container.querySelector<HTMLTextAreaElement>(
    `textarea[name="${name}"]`,
  )!;
  fireEvent.input(textarea, {
    target: { value: value },
  });
}

function createOption(container: HTMLElement, name: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[name="${name}"]`,
  )!;
  const target = { value: value };
  fireEvent.input(input, { target });

  const option = [
    ...container.querySelectorAll<HTMLDivElement>(
      `li.${name} .solid-select-list > div.solid-select-option`,
    ),
  ].find((div) => div.textContent === `Create ${value}`)!;

  fireEvent.click(option);
}

function testContext() {
  const timezone = "America/Denver";
  const api = {
    worklog: {
      $post: vi.fn(),
    },
  } as any;

  const time = new TestTimeAPI(timezone, "2026-08-25T04:00");

  return {
    api,
    time,
    timezone,
  };
}

test("WorklogForm has correct defaults", () => {
  const { container } = render(() => (
    <AppContext.Provider value={testContext()}>
      <WorklogForm
        worklog={() => undefined}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </AppContext.Provider>
  ));

  const received = readWorklog(container);
  expect(received).toEqual({
    id: "NaN",
    duration: "1 hour",
    time: "2026-08-25T04:00",
    name: "",
    notes: "",
    labels: [],
  });
});

test("WorklogForm populates from an existing worklog", () => {
  const worklog = testWorklog({
    id: 1,
    duration: "2 hours",
    time: "2026-08-25T07:00:00.000Z", //UTC will be converted
    name: "Test",
    notes: "Test notes",
    labels: [
      { id: 1, name: "test" },
      { id: 2, name: "test 2" },
    ],
  });
  const { container } = render(() => (
    <AppContext.Provider value={testContext()}>
      <WorklogForm
        worklog={() => worklog}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </AppContext.Provider>
  ));

  const received = readWorklog(container);
  expect(received).toEqual({
    id: "1",
    duration: "2 hours",
    time: "2026-08-25T01:00",
    name: "Test",
    notes: "Test notes",
    labels: ["test", "test 2"],
  });
});

test("WorklogForm updates an existing worklog", () => {
  const worklog = testWorklog({ id: 1 });
  const { container } = render(() => (
    <AppContext.Provider value={testContext()}>
      <WorklogForm
        worklog={() => worklog}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </AppContext.Provider>
  ));

  setInput(container, "name", "Test");
  setInput(container, "duration", "2 hours");
  setInput(container, "time", "2026-08-25T01:00");
  setTextArea(container, "notes", "Test notes");
  createOption(container, "labels", "test");
  createOption(container, "labels", "test 2");

  const received = readWorklog(container);
  expect(received).toEqual({
    id: "1",
    duration: "2 hours",
    time: "2026-08-25T01:00",
    name: "Test",
    notes: "Test notes",
    labels: ["test", "test 2"],
  });
});
