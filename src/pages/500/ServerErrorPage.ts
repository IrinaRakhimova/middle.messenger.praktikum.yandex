import { Block } from '../../framework/Block';
import template from './500.hbs?raw';
import './500.css';

export class ServerErrorPage extends Block {
  constructor() {
    super({});
  }

  protected render(): string {
    return template;
  }
}
