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
  
  // Set up all the routes
  Router.use(Routes.Index, LoginPage)
    .use(Routes.Login, LoginPage)
    .use(Routes.Register, RegisterPage)
    .use(Routes.Profile, ProfilePage)
    .use(Routes.ProfileEdit, ProfileEditPage)
    .use(Routes.PasswordEdit, PasswordEditPage)
    .use(Routes.Chats, ChatsPage)
    .use(Routes.Error400, NotFoundPage)
    .use(Routes.Error500, ServerErrorPage);

  // Check the current path and determine if it's a protected route
  switch (window.location.pathname) {
    case Routes.Login:
    case Routes.Register:
      isProtectedRoute = false;
      break;
  }

  try {
    // Attempt to get the user information
    const user = await authAPI.getUser();
    store.setUser(user);

    // If the user is logged in, redirect them to chats if they're on a public page
    if (!isProtectedRoute) {
      Router.go(Routes.Chats);
    }
  } catch (err) {
    // If the user is not logged in, redirect to the login page if they're on a protected page
    if (isProtectedRoute) {
      Router.go(Routes.Login);
    }
  }

  // Start the router
  Router.start();
});