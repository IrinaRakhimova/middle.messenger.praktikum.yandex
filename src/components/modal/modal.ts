import { Block } from "../../framework/Block";
import template from "./modal.hbs?raw";
import "./modal.css";

interface ModalProps {
  content: string;
  onClose?: () => void;
  [key: string]: unknown;
}

export class Modal extends Block<ModalProps> {
  constructor(props: ModalProps) {
    super(props);
  }

  public show(): void {
    const el = this.getContent();
    if (!el) return;

    if (!document.body.contains(el)) {
      document.body.appendChild(el);
    }

    el.style.display = "flex";
  }

  public close(): void {
    const el = this.getContent();
    if (el) {
      el.style.display = "none";
    }
    this.props.onClose?.();
  }

  public afterRender(): void {
    const el = this.getContent();
    if (!el) return;

    const closeBtn = el.querySelector("#close-modal");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    el.addEventListener("click", (e) => {
      if (e.target === el) {
        this.close();
      }
    });
  }

  protected render(): string {
    return template;
  }
}