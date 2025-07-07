import { Block } from '../../framework/Block';
import template from './chats.hbs?raw';
import { ChatItem } from '../../components/chat-item/chat-item';
import { MessageBubble } from '../../components/message-bubble/message-bubble';
import { Input } from '../../components/input/input';
import { Button } from '../../components/button/button';
import './chats.css';
import { validateField } from '../../utils/validation';

export class ChatsPage extends Block {
  private chats: ChatItem[] = [];
  private messages: MessageBubble[] = [];
  private messageInput!: Input;
  private sendButton!: Button;

  constructor() {
    const chats = [
      new ChatItem({ name: 'Андрей', time: '10:49', lastMessage: 'Привет!', unread: 2 }),
      new ChatItem({ name: 'Киноклуб', time: '12:00', lastMessage: 'стикер', unread: 4 }),
    ];

    const messages = [
      new MessageBubble({ text: 'Привет! Как дела?', time: '12:45', incoming: false }),
      new MessageBubble({ text: 'Привет!', time: '12:46', incoming: true }),
    ];

    const messageInput = new Input({
      type: 'text',
      name: 'message',
      label: 'Сообщение',
      value: '',
    });

    const sendButton = new Button({ label: 'Send' });

    const props = {
      chatList: chats.map(c => c.getContent()?.outerHTML || '').join(''),
      messageList: messages.map(m => m.getContent()?.outerHTML || '').join(''),
      messageInput: messageInput.getContent()?.outerHTML || '',
      sendButton: sendButton.getContent()?.outerHTML || '',
    };

    super(props);
    this.chats = chats;
    this.messages = messages;
    this.messageInput = messageInput;
    this.sendButton = sendButton;
  }

  public afterRender(): void {
  this.chats?.forEach(chat => chat?.afterRender?.());
  this.messages?.forEach(message => message?.afterRender?.());
  this.messageInput?.afterRender?.();
  this.sendButton?.afterRender?.();

  const form = this.getContent()?.querySelector<HTMLFormElement>('#chat-form');
  const input = form?.querySelector<HTMLInputElement>('input[name="message"]');

  input?.addEventListener('blur', () => {
    const { valid, error } = validateField('message', input.value.trim());
    if (!valid) {
      input.classList.add('input-error');
      input.setCustomValidity(error || 'Ошибка');
      input.reportValidity();
    } else {
      input.classList.remove('input-error');
      input.setCustomValidity('');
    }
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    this.handleSend();
  });
}

private handleSend(): void {
  const input = this.getContent()?.querySelector<HTMLInputElement>('input[name="message"]');
  const value = input?.value.trim() || '';

  const { valid, error } = validateField('message', value);

  if (!valid) {
    input?.classList.add('input-error');
    input?.setCustomValidity(error || 'Ошибка');
    input?.reportValidity();
    return;
  }

  input?.classList.remove('input-error');
  input?.setCustomValidity('');

  console.log('Sent message:', value);
  if (input) input.value = '';
}

  protected render(): string {
    return template;
  }
}
