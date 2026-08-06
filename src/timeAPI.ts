import "temporal-polyfill/global";
import "temporal-polyfill/types/global";

export class TimeAPI {
  zone: string;

  constructor(zone: string) {
    this.zone = zone;
  }
  toISOTime(time: string) {
    return new Date(time).toISOString();
  }
  toLocalTime(time: string) {
    return new Date(time)
      .toTemporalInstant()
      .toZonedDateTimeISO(this.zone)
      .round({ smallestUnit: "minute" })
      .toString({ offset: "never", timeZoneName: "never" });
  }
  toDisplayTime(time: string) {
    return new Date(time)
      .toTemporalInstant()
      .toZonedDateTimeISO(this.zone)
      .toLocaleString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short", // Includes the timezone (e.g., EST/EDT)
      });
  }
  today() {
    return Temporal.Now.plainDateISO(this.zone).toString();
  }
  now() {
    return Temporal.Now.zonedDateTimeISO(this.zone)
      .round({ smallestUnit: "minute" })
      .toString({ offset: "never", timeZoneName: "never" });
  }
}

export const createTimeAPI = (timezone: string) => new TimeAPI(timezone);
