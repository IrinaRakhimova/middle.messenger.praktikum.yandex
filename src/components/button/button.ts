import { Block } from "../../framework/Block";
import template from "./button.hbs?raw";
import "./button.css";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  [key: string]: unknown;
}

export class Button extends Block<ButtonProps> {
  private handleClick = () => {
    this.props.onClick?.();
  };

  constructor(props: ButtonProps) {
    super(props);
  }

  public afterRender(): void {
    const el = this.getContent();
    if (el) {
      this.addEventListener(el, "click", this.handleClick);
    }
  }

  protected render(): string {
    return template;
  }
}
