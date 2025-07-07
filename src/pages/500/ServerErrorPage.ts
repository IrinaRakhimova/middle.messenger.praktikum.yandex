import { Block } from "../../framework/Block";
import template from "./500.hbs?raw";
import "./500.css";

export class ServerErrorPage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    const backLink = this.getContent()?.querySelector('a[href="/"]');
    if (backLink) {
      this.addEventListener(backLink, "click", (e) => {
        e.preventDefault();
      });
    }
  }

  protected componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("Component is about to be destroyed");
  }
}
