import "temporal-polyfill/global";
import "temporal-polyfill/types/global";

export interface TimeAPI {
  toISOTime: (time: string) => string;
  toLocalTime: (time: string) => string;
  toDisplayTime: (time: string) => string;
  now: () => string;
  today: () => string;
}

export function createTimeAPI(timezone: string): TimeAPI {
  return {
    toISOTime: (time: string) => new Date(time).toISOString(),
    toLocalTime: (time: string) =>
      new Date(time)
        .toTemporalInstant()
        .toZonedDateTimeISO(timezone)
        .round({ smallestUnit: "minute" })
        .toString({ offset: "never", timeZoneName: "never" }),
    toDisplayTime: (time: string) =>
      new Date(time)
        .toTemporalInstant()
        .toZonedDateTimeISO(timezone)
        .toLocaleString(undefined, {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          timeZoneName: "short", // Includes the timezone (e.g., EST/EDT)
        }),
    today: () => Temporal.Now.plainDateISO(timezone).toString(),
    now: () =>
      Temporal.Now.zonedDateTimeISO(timezone)
        .round({ smallestUnit: "minute" })
        .toString({ offset: "never", timeZoneName: "never" }),
  };
}
