import { WorklogView } from "./WorklogView";

export class WorklogsView {
  container: HTMLElement;

  worklogs = () =>
    [...this.container.querySelectorAll<HTMLLIElement>(`ul.worklog`)].map(
      (ul) => new WorklogView(ul),
    );

  constructor(container: HTMLElement) {
    this.container = container;
  }
}
