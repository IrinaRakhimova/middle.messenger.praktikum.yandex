import { Block } from "../../framework/Block";
import template from "./message-bubble.hbs?raw";
import "./message-bubble.css";

export class MessageBubble extends Block {
  constructor(props: { text: string; time: string; incoming: boolean }) {
    super(props);
  }

  protected render(): string {
    return template;
  }
}
