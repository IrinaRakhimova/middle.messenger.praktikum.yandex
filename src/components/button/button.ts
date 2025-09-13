import { Block } from '../../framework/Block';
import template from './button.hbs?raw';
import './button.css';

interface ButtonProps {
  label: string;
  onClick?: () => void;

  [key: string]: unknown; 
}

export class Button extends Block<ButtonProps> {
  private handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  constructor(props: ButtonProps) {
    super(props);
  }

  public afterRender(): void {
    const el = this.getContent();
    if (el) {
      el.addEventListener('click', this.handleClick);
    }
  }

  protected componentWillUnmount(): void {
    const el = this.getContent();
    if (el) {
      el.removeEventListener('click', this.handleClick);
    }
  }

  protected render(): string {
    return template;
  }
}
