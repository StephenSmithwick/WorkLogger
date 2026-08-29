import { vi, Mock } from "vitest";
import { AppContext, AppContextValue, ApiClient } from "@/context";
import { TestTimeAPI } from "@/test/TestTimeAPI";
import { splitProps, ParentComponent, ParentProps } from "solid-js";

type MockedApi<T> = { [K in keyof T]?: Mock };

type ApiOverrides = {
  worklog?: MockedApi<ApiClient["worklog"]>;
  labels?: MockedApi<ApiClient["labels"]>;
};

type AppContextOverrides = {
  api?: ApiOverrides;
  time?: TestTimeAPI;
  timezone?: string;
};

function testContext(overrides: AppContextOverrides): AppContextValue {
  const timezone = overrides.timezone ?? "America/Denver";
  const api = {
    worklog: {
      $post: vi.fn(),
      $delete: vi.fn(),
      $get: vi.fn(() => []),
      ...overrides.api?.worklog,
    },
    labels: {
      $get: vi.fn(() => []),
      ...overrides.api?.labels,
    },
  } as any;

  const time = overrides.time ?? new TestTimeAPI(timezone, "2026-08-25T04:00");

  return { api, time, timezone };
}

export const TestContext: ParentComponent<AppContextOverrides> = (props) => {
  const [_, overrides] = splitProps(props, ["children"]);
  const context = testContext(overrides);

  return (
    <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
  );
};
