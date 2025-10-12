import Router from "./utils/Router";
import { LoginPage } from "./pages";
import { RegisterPage } from "./pages";
import { ProfilePage } from "./pages";
import { ProfileEditPage } from "./pages";
import { PasswordEditPage } from "./pages";
import { ChatsPage } from "./pages";
import { NotFoundPage } from "./pages";
import { ServerErrorPage } from "./pages";
import { store } from "./store/Store";
import { authAPI } from "./api/authAPI";

export enum Routes {
  Index = "/",
  Login = "/login",
  Register = "/register",
  Profile = "/profile",
  ProfileEdit = "/profile-edit",
  PasswordEdit = "/password-edit",
  Chats = "/chats",
  Error400 = "/404",
  Error500 = "/500",
}

window.addEventListener("DOMContentLoaded", async () => {
  let isProtectedRoute = true;
  let isAuthPage = false;

  switch (window.location.pathname) {
    case Routes.Login:
    case Routes.Register:
      isProtectedRoute = false;
      isAuthPage = true;
      break;
  }

  Router.use(Routes.Index, ChatsPage)
    .use(Routes.Login, LoginPage)
    .use(Routes.Register, RegisterPage)
    .use(Routes.Profile, ProfilePage)
    .use(Routes.ProfileEdit, ProfileEditPage)
    .use(Routes.PasswordEdit, PasswordEditPage)
    .use(Routes.Chats, ChatsPage)
    .use(Routes.Error400, NotFoundPage)
    .use(Routes.Error500, ServerErrorPage);

  try {
    const user = await authAPI.getUser();
    store.setUser(user);

    if (isAuthPage) {
      Router.go(Routes.Chats);
      return;
    }
  } catch (err) {
    store.setUser(null);

    if (isProtectedRoute) {
      Router.go(Routes.Login);
      return;
    }
  }

  Router.start();
});
