import Handlebars from 'handlebars';
import { EventBus } from './EventBus';

type BlockEvents = {
  init: [];
  'flow:render': [];
};

export abstract class Block<TProps extends Record<string, unknown> = Record<string, unknown>> {
  static EVENTS = {
    INIT: 'init',
    FLOW_RENDER: 'flow:render',
  } as const;

  private _element: HTMLElement | null = null;
  protected props: TProps;
  private eventBus: EventBus<BlockEvents>;

  constructor(props: TProps) {
    this.props = props;
    this.eventBus = new EventBus<BlockEvents>();
    this.registerEvents();
    this.eventBus.emit(Block.EVENTS.INIT);
  }

  private registerEvents(): void {
    this.eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    this.eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  private init(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_RENDER);
  }

  protected _render(): void {
    const template = Handlebars.compile(this.render());
    const htmlString = template(this.props);
    const temp = document.createElement('template');
    temp.innerHTML = htmlString.trim();
    this._element = temp.content.firstElementChild as HTMLElement;
    this.afterRender();
  }

  public getContent(): HTMLElement | null {
    return this._element;
  }

  protected abstract render(): string;

  public afterRender(): void {}
}
