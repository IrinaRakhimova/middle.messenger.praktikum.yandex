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

    // Define the base URL for user resources (including avatars)
    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";
    
    // Construct the full URL for the avatar
    const avatarUrl = user.avatar 
        ? `${AVATAR_BASE_URL}${user.avatar}` 
        : "https://via.placeholder.com/150"; // Provide a default placeholder

    const emailInput = new Input({
      type: "email",
      name: "email",
      label: "Почта",
      value: user.email,
    });
    // ... (repeat for all other inputs)
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

    const props = {
      // Pass the avatarUrl to the props
      avatarUrl, 
      emailInput: emailInput.getContent()?.outerHTML || "",
      loginInput: loginInput.getContent()?.outerHTML || "",
      firstNameInput: firstNameInput.getContent()?.outerHTML || "",
      secondNameInput: secondNameInput.getContent()?.outerHTML || "",
      displayNameInput: displayNameInput.getContent()?.outerHTML || "",
      phoneInput: phoneInput.getContent()?.outerHTML || "",
      saveButton: saveButton.getContent()?.outerHTML || "",
    };

    super(props);

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
  }

  protected componentWillUnmount(): void {
    // eslint-disable-next-line no-console
    console.log("ProfileEditPage will unmount");
  }

   private async handleSave(): Promise<void> {
    const form =
      this.getContent()?.querySelector<HTMLFormElement>("#profile-edit-form");
    if (!form) return;

    const inputs = form.querySelectorAll<HTMLInputElement>("input");
    let isValid = true;
    
    // Create an empty object with the correct type
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

      // Assign values to the data object using the correct keys
      // The `as string` type assertion is necessary here
      data[input.name as keyof UserUpdateRequest] = value;
    });

    if (!isValid) {
      console.warn("Validation failed. Please fix the errors.");
      return;
    }

    try {
      // Cast the object to the required type before sending
      const updatedUser = await userAPI.updateProfile(data as UserUpdateRequest);
      
      // Update the store with the new user data
      store.setUser(updatedUser);

      // Redirect the user back to the profile page
      Router.go(Routes.Profile);

      console.log("Profile updated successfully:", updatedUser);

    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  }
}
