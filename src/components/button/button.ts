import { Block } from "../../framework/Block";
import template from "./button.hbs?raw";
import "./button.css";

interface ButtonProps {
  label: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  [key: string]: unknown;
}

export class Button extends Block<ButtonProps> {
  private handleClick = () => {
    this.props.onClick?.();
  };

  public afterRender(): void {
    const el = this.getContent();
    if (el && this.props.onClick) {
      this.addEventListener(el, "click", this.handleClick);
    }
  }

  protected render(): string {
    return template;
  }
}
