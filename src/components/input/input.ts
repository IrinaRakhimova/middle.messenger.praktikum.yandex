import { Block } from '../../framework/Block';
import template from './input.hbs?raw';
import './input.css';

interface InputProps {
  type: string;
  name: string;
  label: string;
  value?: string;
  required?: boolean;

  [key: string]: unknown; 
}

export class Input extends Block<InputProps> {
  constructor(props: InputProps) {
    super(props);
  }

  protected render(): string {
    return template;
  }
}
