import { Block } from '../../framework/Block';
import template from './button.hbs?raw';
import './button.css';

interface ButtonProps {
  label: string;
  onClick?: () => void;

  [key: string]: unknown; 
}

export class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    super(props);
  }

  public afterRender(): void {
    const el = this.getContent();
    if (el && this.props.onClick) {
      el.addEventListener('click', this.props.onClick);
    }
  }

  protected render(): string {
    return template;
  }
}
