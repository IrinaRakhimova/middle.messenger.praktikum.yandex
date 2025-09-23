import { Block } from "../../framework/Block";
import template from "./profile.hbs?raw";
import { Button } from "../../components/button/button";
import "./profile.css";
import { authAPI } from "../../api/authAPI";
import Router from "../../utils/Router";
import { Routes } from "../../main";
import { store, StoreEvents } from "../../store/Store";

export class ProfilePage extends Block {
  private boundOnStoreUpdate: () => void;

  constructor() {
    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";
    const user = store.getState().user;

    console.log("[ProfilePage] constructor called. user =", user);

    const avatarUrl = user?.avatar
      ? `${AVATAR_BASE_URL}${user.avatar}`
      : "https://via.placeholder.com/150";

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
      avatarUrl,
      displayName: user && user.display_name !== undefined ? user.display_name : "Загрузка...",
      email: user?.email || "",
      login: user?.login || "",
      firstName: user?.first_name || "",
      secondName: user?.second_name || "",
      phone: user?.phone || "",
      editButton,
      passwordButton,
      logoutButton,
    });

    this.boundOnStoreUpdate = this.onStoreUpdate.bind(this);
    store.on(StoreEvents.UPDATED, this.boundOnStoreUpdate);

    if (!user) {
      console.log("[ProfilePage] No user in store. Fetching from API...");
      authAPI.getUser().then((fetchedUser) => {
        console.log("[ProfilePage] Fetched user from API:", fetchedUser);
        store.setUser(fetchedUser);
      });
    }

    if (user) {
      this.onStoreUpdate();
    }
  }

  private onStoreUpdate(): void {
    const user = store.getState().user;
    console.log("[ProfilePage] onStoreUpdate called. user =", user);

    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";
    const avatarUrl = user?.avatar
      ? `${AVATAR_BASE_URL}${user.avatar}`
      : "https://via.placeholder.com/150";

    this.setProps({
      avatarUrl,
      displayName: user && user.display_name !== undefined
        ? user.display_name
        : "Загрузка...",
      email: user?.email || "",
      login: user?.login || "",
      firstName: user?.first_name || "",
      secondName: user?.second_name || "",
      phone: user?.phone || "",
    });
  }
  protected render(): string {
    console.log("[ProfilePage] render called with props:", this.props);
    return template;
  }

  protected componentWillUnmount(): void {
    console.log("[ProfilePage] componentWillUnmount called");
    store.off(StoreEvents.UPDATED, this.boundOnStoreUpdate);
  }

  private changeToEdit(): void {
    console.log("[ProfilePage] Navigating to ProfileEdit");
    Router.go(Routes.ProfileEdit);
  }

  private changeToPassword(): void {
    console.log("[ProfilePage] Navigating to PasswordEdit");
    Router.go(Routes.PasswordEdit);
  }

  private async handleLogout(): Promise<void> {
    try {
      console.log("[ProfilePage] Logging out...");
      await authAPI.logout();
      store.setUser(null);
      Router.go(Routes.Login);
    } catch (err) {
      console.error("[ProfilePage] Logout failed", err);
    }
  }
}