import { Block } from "../../framework/Block";
import template from "./chat-item.hbs?raw";
import "./chat-item.css";

interface ChatItemProps {
  id: number;
  name: string;
  time: string;
  lastMessage: string;
  unread: number;
  [key: string]: unknown;
}

export class ChatItem extends Block<ChatItemProps> {
  constructor(props: ChatItemProps) {
    super(props);
  }

  protected render(): string {
    return template;
  }
}