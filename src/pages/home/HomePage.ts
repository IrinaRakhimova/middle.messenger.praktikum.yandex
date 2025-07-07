import { Block } from '../../framework/Block';
import template from './home.hbs?raw';
import './home.css';

export class HomePage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return template;
  }
}
