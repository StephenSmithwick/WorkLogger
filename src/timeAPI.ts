import "temporal-polyfill/global";
import "temporal-polyfill/types/global";

const ZERO = { days: 0 };
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
        timeZoneName: "short",
      });
  }
  toAPITime(time: string, add?: Temporal.DurationLikeObject) {
    return new Date(time)
      .toTemporalInstant()
      .toZonedDateTimeISO(this.zone)
      .add({ ...ZERO, ...add })
      .toString({ timeZoneName: "never" });
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
