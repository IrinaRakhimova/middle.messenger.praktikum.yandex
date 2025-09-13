import { Block } from "../../framework/Block";
import template from "./login.hbs?raw";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import "./login.css";
import { validateField } from "../../utils/validation";

export class LoginPage extends Block {
  private loginInput: Input;
  private passwordInput: Input;
  private submitButton: Button;

  constructor() {
    const loginInput = new Input({
      type: "text",
      name: "login",
      label: "Логин",
      value: "",
      required: true,
    });
    const passwordInput = new Input({
      type: "password",
      name: "password",
      label: "Пароль",
      value: "",
      required: true,
    });
    const submitButton = new Button({
      label: "Авторизоваться",
      type: "submit",
      onClick: () => this.handleSubmit(),
    });

    super({
      loginInput:
        loginInput.getContent()?.outerHTML ||
        "<div>Login input failed to render</div>",
      passwordInput:
        passwordInput.getContent()?.outerHTML ||
        "<div>Password input failed to render</div>",
      submitButton:
        submitButton.getContent()?.outerHTML ||
        "<div>Submit button failed to render</div>",
    });

    this.loginInput = loginInput;
    this.passwordInput = passwordInput;
    this.submitButton = submitButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    this.loginInput?.afterRender();
    this.passwordInput?.afterRender();
    this.submitButton?.afterRender();

    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#login-form");
    const loginEl = form?.querySelector<HTMLInputElement>(
      'input[name="login"]'
    );
    const passwordEl = form?.querySelector<HTMLInputElement>(
      'input[name="password"]'
    );

    if (loginEl) {
      this.addEventListener(loginEl, "blur", () => {
        const { valid, error } = validateField("login", loginEl.value.trim());
        loginEl.setCustomValidity(valid ? "" : error || "Ошибка");
        if (!valid) loginEl.reportValidity();
      });
    }

    if (passwordEl) {
      this.addEventListener(passwordEl, "blur", () => {
        const { valid, error } = validateField(
          "password",
          passwordEl.value.trim()
        );
        passwordEl.setCustomValidity(valid ? "" : error || "Ошибка");
        if (!valid) passwordEl.reportValidity();
      });
    }

    if (form) {
      this.addEventListener(form, "submit", (e) => {
        e.preventDefault();
        this.handleSubmit(loginEl, passwordEl);
      });
    }
  }

  protected componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("LoginPage is being destroyed");
  }

  private handleSubmit(
    loginEl?: HTMLInputElement | null,
    passwordEl?: HTMLInputElement | null
  ): void {
    if (!loginEl || !passwordEl) return;

    const login = loginEl.value.trim();
    const password = passwordEl.value.trim();

    const loginValid = validateField("login", login);
    const passwordValid = validateField("password", password);

    if (!loginValid.valid) {
      loginEl.setCustomValidity(loginValid.error || "");
      loginEl.reportValidity();
    } else {
      loginEl.setCustomValidity("");
    }

    if (!passwordValid.valid) {
      passwordEl.setCustomValidity(passwordValid.error || "");
      passwordEl.reportValidity();
    } else {
      passwordEl.setCustomValidity("");
    }

    if (!loginValid.valid || !passwordValid.valid) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log("Login attempt:", { login, password });
  }
}
