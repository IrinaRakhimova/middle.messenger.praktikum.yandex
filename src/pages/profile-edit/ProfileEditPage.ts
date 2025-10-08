import { Block } from "../../framework/Block";
import template from "./profile-edit.hbs?raw";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import "./profile-edit.css";
import { validateField } from "../../utils/validation";
import { store } from "../../store/Store";
import Router from "../../utils/Router";
import { Routes } from "../../main";
import { userAPI, UserUpdateRequest } from "../../api/userAPI";
import { authAPI } from "../../api/authAPI";

export class ProfileEditPage extends Block {
  private emailInput: Input;
  private loginInput: Input;
  private firstNameInput: Input;
  private secondNameInput: Input;
  private displayNameInput: Input;
  private phoneInput: Input;
  private saveButton: Button;

  constructor() {
    const user = store.getState().user;

    if (!user) {
      Router.go(Routes.Login);
      return;
    }

    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";
    const avatarUrl = user.avatar
      ? `${AVATAR_BASE_URL}${user.avatar}`
      : "https://via.placeholder.com/150";

    const emailInput = new Input({
      type: "email",
      name: "email",
      label: "Почта",
      value: user.email,
    });
    const loginInput = new Input({
      type: "text",
      name: "login",
      label: "Логин",
      value: user.login,
    });
    const firstNameInput = new Input({
      type: "text",
      name: "first_name",
      label: "Имя",
      value: user.first_name,
    });
    const secondNameInput = new Input({
      type: "text",
      name: "second_name",
      label: "Фамилия",
      value: user.second_name,
    });
    const displayNameInput = new Input({
      type: "text",
      name: "display_name",
      label: "Имя в чате",
      value: user.display_name || "",
    });
    const phoneInput = new Input({
      type: "tel",
      name: "phone",
      label: "Телефон",
      value: user.phone,
    });
    const saveButton = new Button({
      label: "Сохранить",
      type: "submit",
    });

    super({
      avatarUrl,
      emailInput,
      loginInput,
      firstNameInput,
      secondNameInput,
      displayNameInput,
      phoneInput,
      saveButton,
    });

    this.emailInput = emailInput;
    this.loginInput = loginInput;
    this.firstNameInput = firstNameInput;
    this.secondNameInput = secondNameInput;
    this.displayNameInput = displayNameInput;
    this.phoneInput = phoneInput;
    this.saveButton = saveButton;
  }

  protected render(): string {
    return template;
  }

  public afterRender(): void {
    this.emailInput?.afterRender?.();
    this.loginInput?.afterRender?.();
    this.firstNameInput?.afterRender?.();
    this.secondNameInput?.afterRender?.();
    this.displayNameInput?.afterRender?.();
    this.phoneInput?.afterRender?.();
    this.saveButton?.afterRender?.();

    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#profile-edit-form");

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

    const avatarInput = this.getContent()?.querySelector<HTMLInputElement>(
      "#avatarInput"
    );
    if (avatarInput) {
      this.addEventListener(avatarInput, "change", async () => {
        const file = avatarInput.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("avatar", file);

        try {
          const updatedUser = await userAPI.updateAvatar(formData);

          store.setUser(updatedUser);

          const avatarImg = this.getContent()?.querySelector<HTMLImageElement>(
            ".avatar-image"
          );
          if (avatarImg) {
            const baseUrl = "https://ya-praktikum.tech/api/v2/resources";
            avatarImg.src = updatedUser.avatar
              ? `${baseUrl}${updatedUser.avatar}`
              : "https://via.placeholder.com/150";
          }
        } catch (err) {
          console.error("Failed to update avatar:", err);
        }
      });
    }
  }

  private async handleSave(): Promise<void> {
    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#profile-edit-form");
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>("input");
    let isValid = true;

    const data: Partial<UserUpdateRequest> = {};

    inputs.forEach((input) => {
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

      data[input.name as keyof UserUpdateRequest] = value;
    });

    if (!isValid) {
      console.warn("Validation failed. Please fix the errors.");
      return;
    }

    try {
      await userAPI.updateProfile(data as UserUpdateRequest);

      const freshUser = await authAPI.getUser();
      store.setUser(freshUser);

      Router.go(Routes.Profile);

    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  }
}
