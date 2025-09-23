import Handlebars from "handlebars";
import { EventBus } from "./EventBus";

type BlockEvents = {
  init: [];
  "flow:render": [];
  "flow:props-changed": [oldProps: any, newProps: any];
};

let _idCounter = 0;

export abstract class Block<
  TProps extends Record<string, unknown> = Record<string, unknown>
> {
  static EVENTS = {
    INIT: "init",
    FLOW_RENDER: "flow:render",
    FLOW_PROPS_CHANGED: "flow:props-changed",
  } as const;

  private _element: HTMLElement | null = null;
  protected props: TProps;
  private eventBus: EventBus<BlockEvents>;

  private _listeners: Array<{
    element: Element;
    type: string;
    listener: EventListenerOrEventListenerObject;
  }> = [];

  private _id: number;

  constructor(props: TProps) {
    this._id = _idCounter++;
    this.props = props;
    this.eventBus = new EventBus<BlockEvents>();
    this.registerEvents();
    this.eventBus.emit(Block.EVENTS.INIT);
  }

  private registerEvents(): void {
    this.eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    this.eventBus.on(Block.EVENTS.FLOW_PROPS_CHANGED, this._render.bind(this));
  }

  private init(): void {
    this.eventBus.emit(Block.EVENTS.FLOW_PROPS_CHANGED, {}, this.props);
  }

  public get id(): number {
    return this._id;
  }

  private _render(oldProps: any, newProps: any): void {
    if (this._element && !this.shouldComponentUpdate(oldProps, newProps)) {
      return;
    }

    this.removeEventListeners();

    const template = Handlebars.compile(this.render());

    const templateProps: Record<string, unknown> = {};
    Object.entries(newProps || {}).forEach(([key, value]) => {
      if (value instanceof Block) {
        templateProps[key] = `<div data-block-id="${value.id}"></div>`;
      } else {
        templateProps[key] = value;
      }
    });

    const htmlString = template(templateProps);
    const temp = document.createElement("template");
    temp.innerHTML = htmlString.trim();

    if (!this._element) {
      this._element = temp.content.firstElementChild as HTMLElement;
    } else {
      this._element.innerHTML = temp.content.firstElementChild!.innerHTML;
    }

    Object.values(newProps || {}).forEach((child) => {
      if (child instanceof Block) {
        const placeholder = this._element?.querySelector(
          `[data-block-id="${child.id}"]`
        );
        if (placeholder) {
          const childContent = child.getContent();
          if (childContent) {
            placeholder.replaceWith(childContent);
            child.afterRender();
          }
        }
      }
    });

    this.afterRender();
  }

  protected getChildren(): Record<string, Block> {
    const children: Record<string, Block> = {};
    Object.entries(this.props).forEach(([key, value]) => {
      if (value instanceof Block) {
        children[key] = value;
      }
    });
    return children;
  }

  public getContent(): HTMLElement | null {
    return this._element;
  }

  protected abstract render(): string;

  public afterRender(): void { }

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

  protected componentWillUnmount(): void { }

  public destroy(): void {
    this.componentWillUnmount();
    this.removeEventListeners();

    Object.values(this.getChildren()).forEach((child) => child.destroy());

    this._element = null;
  }

  public setProps(nextProps: Partial<TProps>): void {
    if (!nextProps) return;
    const oldProps = { ...this.props };
    this.props = { ...this.props, ...nextProps };
    this.eventBus.emit(Block.EVENTS.FLOW_PROPS_CHANGED, oldProps, this.props);
  }

  public hide(): void {
    const el = this.getContent();
    if (el) el.style.display = "none";
  }

  public show(): void {
    const el = this.getContent();
    if (el) el.style.display = "";
  }

  protected shouldComponentUpdate(oldProps: TProps, newProps: TProps): boolean {
    const oldKeys = Object.keys(oldProps);
    const newKeys = Object.keys(newProps);

    if (oldKeys.length !== newKeys.length) {
      return true;
    }

    for (const key of oldKeys) {
      if (!(oldProps[key] instanceof Block) && oldProps[key] !== newProps[key]) {
        return true;
      }
    }

    return false;
  }
}