import { Block } from '../../framework/Block';
import template from './404.hbs?raw';
import './404.css';

export class NotFoundPage extends Block {
  constructor() {
    super({
    });
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    const backLink = this.getContent()?.querySelector('a[href="/"]');
    if (backLink) {
      backLink.addEventListener('click', (e) => {
        e.preventDefault();
      });
    }
  }
}
