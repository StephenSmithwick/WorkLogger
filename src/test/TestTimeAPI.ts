import { TimeAPI } from "@/TimeAPI";

type DateTime = `${string}-${string}-${string}T${string}:${string}`;

export class TestTimeAPI extends TimeAPI {
  mockDateTime: DateTime;

  constructor(zone: string, date: DateTime) {
    super(zone, () => date.split("T")[0]);
    this.mockDateTime = date;
  }
  override today() {
    return this.mockDateTime.split("T")[0];
  }
  override defaultTime() {
    return this.mockDateTime.split("T")[1];
  }
}
