import { Block } from '../../framework/Block';
import template from './chat-item.hbs?raw';
import './chat-item.css';

export class ChatItem extends Block {
  constructor(props: {
    name: string;
    time: string;
    lastMessage: string;
    unread: number;
  }) {
    super(props);
  }

  protected render(): string {
    return template;
  }
}
