import { expect, test, vi } from "vitest";
import { render } from "@solidjs/testing-library";
import { WorklogForm } from "./WorklogForm";
import { testWorklog } from "@/test/fixtures";
import { TestContext } from "@/test/TestContext";
import { WorklogFormView } from "@/test/WorklogFormView";

test("WorklogForm has correct defaults", () => {
  const { container } = render(() => (
    <TestContext>
      <WorklogForm
        worklog={() => undefined}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </TestContext>
  ));

  const received = new WorklogFormView(container);
  expect(received.values()).toEqual({
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
    <TestContext>
      <WorklogForm
        worklog={() => worklog}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </TestContext>
  ));

  const received = new WorklogFormView(container);
  expect(received.values()).toEqual({
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
  const $post = vi.fn();
  const { container } = render(() => (
    <TestContext api={{ worklog: { $post } }}>
      <WorklogForm
        worklog={() => worklog}
        labels={() => []}
        onLabelsCreated={vi.fn()}
        onSubmitted={vi.fn()}
        expanded={() => false}
        setExpanded={vi.fn()}
      />
    </TestContext>
  ));

  const form = new WorklogFormView(container);
  form.setValues({
    name: "Test",
    duration: "2 hours",
    time: "2026-08-25T01:00",
    notes: "Test notes",
    labels: [
      { input: "test", select: "Create test" },
      { input: "test 2", select: "Create test 2" },
    ],
  });

  expect(form.values()).toEqual({
    id: "1",
    duration: "2 hours",
    time: "2026-08-25T01:00",
    name: "Test",
    notes: "Test notes",
    labels: ["test", "test 2"],
  });

  form.submit();
  expect($post).toHaveBeenCalledExactlyOnceWith({
    json: {
      duration: "1 hour",
      id: 1,
      labels: [{ name: "test" }, { name: "test 2" }],
      name: "Test work",
      notes: "Test notes",
      time: "2026-08-25T10:00:00.000Z",
    },
  });
});
