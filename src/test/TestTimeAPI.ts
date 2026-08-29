import { TimeAPI } from "@/TimeAPI";

type DateTime = `${string}-${string}-${string}T${string}:${string}`;

export class TestTimeAPI extends TimeAPI {
  mockNow: DateTime;

  constructor(zone: string, now: DateTime) {
    super(zone);
    this.mockNow = now;
  }
  override now() {
    return this.mockNow;
  }
}
