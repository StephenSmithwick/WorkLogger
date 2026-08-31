import { vi } from "vitest";

const originalWarn = console.warn;

vi.spyOn(console, "warn").mockImplementation((...args) => {
  if (args[0].startsWith("When 'key' option is specified")) return;

  originalWarn(...args);
});
