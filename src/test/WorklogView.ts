import { fireEvent } from "@solidjs/testing-library";

interface Values {
  duration: string;
  time: string;
  name: string;
  notes: string;
  labels: string[];
}

export class WorklogView {
  container: HTMLElement;

  #field = (name: string) => this.container.querySelector(`li.${name}`)!;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  values(): Values {
    return {
      duration: this.#field("duration").textContent,
      time: this.#field("time").textContent,
      name: this.#field("name").textContent,
      notes: this.#field("notes").textContent,
      labels: [...this.#field("labels").querySelectorAll("span")].map(
        (span) => span.textContent,
      ),
    };
  }

  editToggle() {
    const button = this.container.querySelector("button.edit")!;
    fireEvent.click(button);
  }

  delete() {
    const button = this.container.querySelector("button.delete")!;
    fireEvent.click(button);
  }
}
