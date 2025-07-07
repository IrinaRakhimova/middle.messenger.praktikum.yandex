import { Block } from "../../framework/Block";
import template from "./password-edit.hbs?raw";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import "./password-edit.css";
import { validateField } from "../../utils/validation";

export class PasswordEditPage extends Block {
  private oldPasswordInput: Input;
  private newPasswordInput: Input;
  private confirmPasswordInput: Input;
  private saveButton: Button;

  constructor() {
    const oldPasswordInput = new Input({
      type: "password",
      name: "oldPassword",
      label: "Старый пароль",
      value: "",
    });
    const newPasswordInput = new Input({
      type: "password",
      name: "newPassword",
      label: "Новый пароль",
      value: "",
    });
    const confirmPasswordInput = new Input({
      type: "password",
      name: "confirmPassword",
      label: "Повторите новый пароль",
      value: "",
    });
    const saveButton = new Button({   
      label: "Сохранить",
      type: "submit",
      onClick: () => this.handleSave(),
    });

    super({
      oldPasswordInput: oldPasswordInput.getContent()?.outerHTML,
      newPasswordInput: newPasswordInput.getContent()?.outerHTML,
      confirmPasswordInput: confirmPasswordInput.getContent()?.outerHTML,
      saveButton: saveButton.getContent()?.outerHTML,
    });

    this.oldPasswordInput = oldPasswordInput;
    this.newPasswordInput = newPasswordInput;
    this.confirmPasswordInput = confirmPasswordInput;
    this.saveButton = saveButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    this.oldPasswordInput?.afterRender?.();
    this.newPasswordInput?.afterRender?.();
    this.confirmPasswordInput?.afterRender?.();
    this.saveButton?.afterRender?.();

    const form = this.getContent()?.querySelector<HTMLFormElement>(
      "#password-edit-form"
    );
    const inputs = form?.querySelectorAll<HTMLInputElement>("input");

    inputs?.forEach((input) => {
      this.addEventListener(input, "blur", () => {
        const { valid, error } = validateField(input.name, input.value.trim());
        if (!valid) {
          input.classList.add("input-error");
          input.setCustomValidity(error || "Ошибка");
          input.reportValidity();
        } else {
          input.classList.remove("input-error");
          input.setCustomValidity("");
        }
      });
    });

    if (form) {
      this.addEventListener(form, "submit", (e) => {
        e.preventDefault();
        this.handleSave();
      });
    }
  }

  protected componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("PasswordEditPage is being destroyed");
  }
  private handleSave(): void {
    const form = this.getContent()?.querySelector<HTMLFormElement>(
      "#password-edit-form"
    );
    const inputs = form?.querySelectorAll<HTMLInputElement>("input");

    let isValid = true;
    const data: Record<string, string> = {};

    inputs?.forEach((input) => {
      const value = input.value.trim();
      const { valid, error } = validateField(input.name, value);
      if (!valid) {
        isValid = false;
        input.classList.add("input-error");
        input.setCustomValidity(error || "Ошибка");
        input.reportValidity();
      } else {
        input.classList.remove("input-error");
        input.setCustomValidity("");
      }

      data[input.name] = value;
    });

    if (data.newPassword !== data.confirmPassword) {
      isValid = false;
      const confirm = form?.querySelector<HTMLInputElement>(
        'input[name="confirmPassword"]'
      );
      confirm?.setCustomValidity("Пароли не совпадают");
      confirm?.reportValidity();
    }

    if (!isValid) {
      // eslint-disable-next-line no-console
      console.warn("Validation failed");
      return;
    }
    // eslint-disable-next-line no-console
    console.log("Change password:", data);
  }
}
