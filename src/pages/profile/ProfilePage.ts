import { Block } from "../../framework/Block";
import template from "./profile.hbs?raw";
import { Button } from "../../components/button/button";
import "./profile.css";
import { authAPI } from "../../api/authAPI";
import Router from "../../utils/Router";
import { Routes } from "../../main";

interface ProfilePageProps {
  displayName: string;
  email: string;
  login: string;
  firstName: string;
  secondName: string;
  phone: string;
  editButton: Button;
  passwordButton: Button;
  logoutButton: Button;
  [key: string]: unknown;
}

export class ProfilePage extends Block<ProfilePageProps> {
  constructor() {
    const editButton = new Button({
      label: "Изменить данные",
      onClick: () => this.changeToEdit(),
    });

    const passwordButton = new Button({
      label: "Изменить пароль",
      onClick: () => this.changeToPassword(),
    });

    const logoutButton = new Button({
      label: "Выйти",
      onClick: () => this.handleLogout(),
    });

    super({
      displayName: "Иван Иванов",
      email: "ivan@example.com",
      login: "ivanivanov",
      firstName: "Иван",
      secondName: "Иванов",
      phone: "+71234567890",
      editButton,
      passwordButton,
      logoutButton,
    });
  }

  protected render(): string {
    return template;
  }

  private changeToEdit(): void {
    console.log("Navigating to profile edit...");
  }

  private changeToPassword(): void {
    console.log("Navigating to password change...");
  }

  private async handleLogout(): Promise<void> {
    try {
      await authAPI.logout();
      console.log("Logout success");
      Router.go(Routes.Login);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  protected componentWillUnmount(): void {
    console.log("ProfilePage is being destroyed");
  }
}
