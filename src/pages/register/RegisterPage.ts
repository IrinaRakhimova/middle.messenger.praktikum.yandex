import { Block } from "../../framework/Block";
import template from "./register.hbs?raw";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import "./register.css";
import { validateField } from "../../utils/validation";

export class RegisterPage extends Block {
  private emailInput: Input;
  private loginInput: Input;
  private firstNameInput: Input;
  private secondNameInput: Input;
  private phoneInput: Input;
  private passwordInput: Input;
  private confirmPasswordInput: Input;
  private submitButton: Button;

  constructor() {
    const emailInput = new Input({
      type: "email",
      name: "email",
      label: "Почта",
    });
    const loginInput = new Input({
      type: "text",
      name: "login",
      label: "Логин",
    });
    const firstNameInput = new Input({
      type: "text",
      name: "first_name",
      label: "Имя",
    });
    const secondNameInput = new Input({
      type: "text",
      name: "second_name",
      label: "Фамилия",
    });
    const phoneInput = new Input({
      type: "tel",
      name: "phone",
      label: "Телефон",
    });
    const passwordInput = new Input({
      type: "password",
      name: "password",
      label: "Пароль",
    });
    const confirmPasswordInput = new Input({
      type: "password",
      name: "password_confirm",
      label: "Пароль (ещё раз)",
    });
    const submitButton = new Button({ 
      label: "Зарегистрироваться",
      type: "submit", 
    });

    super({
      emailInput:
        emailInput.getContent()?.outerHTML ||
        "<div>Email input failed to render</div>",
      loginInput:
        loginInput.getContent()?.outerHTML ||
        "<div>Login input failed to render</div>",
      firstNameInput:
        firstNameInput.getContent()?.outerHTML ||
        "<div>First name input failed to render</div>",
      secondNameInput:
        secondNameInput.getContent()?.outerHTML ||
        "<div>Second name input failed to render</div>",
      phoneInput:
        phoneInput.getContent()?.outerHTML ||
        "<div>Phone input failed to render</div>",
      passwordInput:
        passwordInput.getContent()?.outerHTML ||
        "<div>Password input failed to render</div>",
      confirmPasswordInput:
        confirmPasswordInput.getContent()?.outerHTML ||
        "<div>Confirm password input failed to render</div>",
      submitButton:
        submitButton.getContent()?.outerHTML ||
        "<div>Submit button failed to render</div>",
    });

    this.emailInput = emailInput;
    this.loginInput = loginInput;
    this.firstNameInput = firstNameInput;
    this.secondNameInput = secondNameInput;
    this.phoneInput = phoneInput;
    this.passwordInput = passwordInput;
    this.confirmPasswordInput = confirmPasswordInput;
    this.submitButton = submitButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    this.emailInput?.afterRender();
    this.loginInput?.afterRender();
    this.firstNameInput?.afterRender();
    this.secondNameInput?.afterRender();
    this.phoneInput?.afterRender();
    this.passwordInput?.afterRender();
    this.confirmPasswordInput?.afterRender();
    this.submitButton?.afterRender();

    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#register-form");
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>("input[name]");
    inputs.forEach((input) => {
      this.addEventListener(input, "blur", () => this.validateInput(input));
    });

    this.addEventListener(form, "submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  private validateInput(input: HTMLInputElement): boolean {
    const name = input.name;
    const value = input.value.trim();

    if (name === "password_confirm") {
      const passwordInput = this.getContent()?.querySelector<HTMLInputElement>(
        'input[name="password"]'
      );
      if (!passwordInput) return false;

      if (value !== passwordInput.value.trim()) {
        this.showError(input, "Пароли не совпадают");
        return false;
      } else {
        this.clearError(input);
        return true;
      }
    }

    const result = validateField(name, value);
    if (!result.valid && result.error) {
      this.showError(input, result.error);
      return false;
    } else {
      this.clearError(input);
      return true;
    }
  }

  private showError(input: HTMLInputElement, message: string) {
    let errorDiv = this.getContent()?.querySelector<HTMLDivElement>(
      `.error-message[data-error-for="${input.name}"]`
    );
    if (!errorDiv) {
      errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.setAttribute("data-error-for", input.name);
      input.insertAdjacentElement("afterend", errorDiv);
    }
    errorDiv.textContent = message;
    input.classList.add("input-error");
  }

  private clearError(input: HTMLInputElement) {
    const errorDiv = this.getContent()?.querySelector<HTMLDivElement>(
      `.error-message[data-error-for="${input.name}"]`
    );
    if (errorDiv) {
      errorDiv.textContent = "";
    }
    input.classList.remove("input-error");
  }

  private handleSubmit(): void {
    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#register-form");
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>("input[name]");
    let formIsValid = true;

    inputs.forEach((input) => {
      const valid = this.validateInput(input);
      if (!valid) formIsValid = false;
    });

    if (!formIsValid) {
      // eslint-disable-next-line no-console
      console.log("Form contains errors. Fix them before submitting.");
      return;
    }

    const formData = new FormData(form);
    const data: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value.toString().trim();
    }
    // eslint-disable-next-line no-console
    console.log("Register form data:", data);
  }

  protected componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("ProfileEditPage will unmount");
  }
}
