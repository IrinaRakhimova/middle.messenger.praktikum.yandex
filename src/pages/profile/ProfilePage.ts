import { Block } from "../../framework/Block";
import template from "./profile.hbs?raw";
import { Button } from "../../components/button/button";
import "./profile.css";
import { authAPI } from "../../api/authAPI";
import Router from "../../utils/Router";
import { Routes } from "../../main";
import { store, StoreEvents } from "../../store/Store";

export class ProfilePage extends Block {
  constructor() {
    const user = store.getState().user;

    // Define the base URL for user resources (avatars)
    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";

    // Construct the full URL for the avatar, or use a placeholder if one doesn't exist
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
      // Pass the avatarUrl to your component's props
      avatarUrl, 
      displayName: user?.display_name || `${user?.first_name} ${user?.second_name}` || "Загрузка...",
      email: user?.email || "",
      login: user?.login || "",
      firstName: user?.first_name || "",
      secondName: user?.second_name || "",
      phone: user?.phone || "",
      editButton,
      passwordButton,
      logoutButton,
    });
    
    // Subscribe to store updates to re-render the page
    store.on(StoreEvents.UPDATED, this.onStoreUpdate.bind(this));
  }

  // Handle store updates
  private onStoreUpdate(): void {
    const user = store.getState().user;
    const AVATAR_BASE_URL = "https://ya-praktikum.tech/api/v2/resources";
    
    if (user) {
      // Re-generate the avatar URL based on the updated user object
      const avatarUrl = user.avatar
        ? `${AVATAR_BASE_URL}${user.avatar}`
        : "https://via.placeholder.com/150";

      this.setProps({
        // Update the avatarUrl prop
        avatarUrl,
        displayName: user.display_name || `${user.first_name} ${user.second_name}`,
        email: user.email,
        login: user.login,
        firstName: user.first_name,
        secondName: user.second_name,
        phone: user.phone,
      });
    }
  }

  protected render(): string {
    return template;
  }
  
  protected componentWillUnmount(): void {
    // Unsubscribe from the store to prevent memory leaks
    store.off(StoreEvents.UPDATED, this.onStoreUpdate.bind(this));
  }

  // The rest of the methods remain the same
  private changeToEdit(): void {
    console.log("Navigating to profile edit...");
  }

  private changeToPassword(): void {
    console.log("Navigating to password change...");
  }

  private async handleLogout(): Promise<void> {
    try {
      await authAPI.logout();
      // Clear user data from the store on logout
      store.setUser(null);
      console.log("Logout success");
      Router.go(Routes.Login);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }
}