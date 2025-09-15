import Handlebars from "handlebars";
import { EventBus } from "./EventBus";

type BlockEvents = {
  init: [];
  "flow:render": [];
};

export abstract class Block<
  TProps extends Record<string, unknown> = Record<string, unknown>
> {
  static EVENTS = {
    INIT: "init",
    FLOW_RENDER: "flow:render",
  } as const;

  private _element: HTMLElement | null = null;
  protected props: TProps;
  private eventBus: EventBus<BlockEvents>;

  private _listeners: Array<{
    element: Element;
    type: string;
    listener: EventListenerOrEventListenerObject;
  }> = [];

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

  private _render(): void {
    this.removeEventListeners();

    const template = Handlebars.compile(this.render());

    const templateProps: Record<string, unknown> = {};
    Object.entries(this.props || {}).forEach(([key, value]) => {
      if (value instanceof Block) {
        templateProps[key] = `<div data-block="${key}"></div>`;
      } else {
        templateProps[key] = value;
      }
    });

    const htmlString = template(templateProps);
    const temp = document.createElement("template");
    temp.innerHTML = htmlString.trim();
    this._element = temp.content.firstElementChild as HTMLElement;

    Object.entries(this.props || {}).forEach(([key, value]) => {
      if (value instanceof Block) {
        const placeholder = this._element?.querySelector(
          `[data-block="${key}"]`
        );
        const childContent = value.getContent();
        if (placeholder && childContent) {
          placeholder.replaceWith(childContent);
          value.afterRender();
        }
      }
    });

    this.afterRender();
  }

  public getContent(): HTMLElement | null {
    return this._element;
  }

  protected abstract render(): string;

  public afterRender(): void {}

  protected addEventListener<K extends keyof HTMLElementEventMap>(
    element: Element,
    type: K,
    listener: (this: Element, ev: HTMLElementEventMap[K]) => any
  ): void {
    element.addEventListener(type, listener);
    this._listeners.push({ element, type, listener });
  }

  protected removeEventListeners(): void {
    this._listeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this._listeners = [];
  }

  protected componentWillUnmount(): void {}

  public destroy(): void {
    this.componentWillUnmount();
    this.removeEventListeners();

    Object.values(this.props || {}).forEach((value) => {
      if (value instanceof Block) {
        value.destroy();
      }
    });

    this._element = null;
  }

  public hide(): void {
    const el = this.getContent();
    if (el) el.style.display = "none";
  }

  public show(): void {
    const el = this.getContent();
    if (el) el.style.display = "";
  }
}
