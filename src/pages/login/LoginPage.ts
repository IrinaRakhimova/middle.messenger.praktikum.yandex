import { Block } from "../../framework/Block";
import template from "./login.hbs?raw";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import "./login.css";
import { validateField } from "../../utils/validation";
import { authAPI } from "../../api/authAPI";   
import Router from "../../utils/Router";      
import { Routes } from "../../main";

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

    if (form) {
      this.addEventListener(form, "submit", (e) => {
        e.preventDefault();
        this.handleSubmit(loginEl, passwordEl);
      });
    }
  }

  private async handleSubmit(
    loginEl?: HTMLInputElement | null,
    passwordEl?: HTMLInputElement | null
  ): Promise<void> {
    if (!loginEl || !passwordEl) return;

    const login = loginEl.value.trim();
    const password = passwordEl.value.trim();

    const loginValid = validateField("login", login);
    console.log("Login value:", login, "Validation result:", loginValid);
    const passwordValid = validateField("password", password);

    if (!loginValid.valid) {
      loginEl.setCustomValidity(loginValid.error || "");
      loginEl.reportValidity();
      return;
    } else {
      loginEl.setCustomValidity("");
    }

    if (!passwordValid.valid) {
      passwordEl.setCustomValidity(passwordValid.error || "");
      passwordEl.reportValidity();
      return;
    } else {
      passwordEl.setCustomValidity("");
    }

    try {
      await authAPI.signin({ login, password });
      console.log("Login success");

      const user = await authAPI.getUser();
      console.log("Current user:", user);

      Router.go(Routes.Chats);

    } catch (err) {
      console.error("Login failed", err);
      alert("Неверный логин или пароль");
    }
  }
}
