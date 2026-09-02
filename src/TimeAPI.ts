import { Accessor } from "solid-js";
import "temporal-polyfill/global";
import "temporal-polyfill/types/global";

const ZERO = { days: 0 };
export class TimeAPI {
  date: Accessor<string>;
  zone: string;

  constructor(zone: string, date: Accessor<string>) {
    this.zone = zone;
    this.date = date;
  }

  toAPITime(time: string, add?: Temporal.DurationLikeObject) {
    return new Date(time)
      .toTemporalInstant()
      .toZonedDateTimeISO(this.zone)
      .add({ ...ZERO, ...add })
      .toString({ timeZoneName: "never" });
  }
  toISOTime(time: string) {
    return Temporal.PlainDate.from(this.date())
      .toZonedDateTime({
        plainTime: time,
        timeZone: this.zone,
      })
      .toString({ timeZoneName: "never" });
  }
  toLocalTime(time: string) {
    return Temporal.Instant.from(time)
      .toZonedDateTimeISO(this.zone)
      .toPlainTime()
      .toString({
        smallestUnit: "minute",
      });
  }
  displayDateTime(time: string) {
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

  today() {
    return Temporal.Now.plainDateISO(this.zone).toString();
  }
  defaultTime() {
    return Temporal.Now.plainTimeISO(this.zone).toString({
      smallestUnit: "minute",
    });
  }
}
