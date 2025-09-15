import { HTTPTransport } from "./HTTPTransport";

const authAPIInstance = new HTTPTransport(
  "https://ya-praktikum.tech/api/v2/auth"
);

export type SignUpRequest = {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
};

export type SignInRequest = {
  login: string;
  password: string;
};

export type UserResponse = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string | null;
  login: string;
  avatar: string | null;
  email: string;
  phone: string;
};

class AuthAPI {
  signup(data: SignUpRequest): Promise<UserResponse> {
    return authAPIInstance.post("/signup", { data }) as Promise<UserResponse>;
  }

  signin(data: SignInRequest): Promise<void> {
    return authAPIInstance.post("/signin", { data }) as Promise<void>;
  }

  getUser(): Promise<UserResponse> {
    return authAPIInstance.get("/user") as Promise<UserResponse>;
  }

  logout(): Promise<void> {
    return authAPIInstance.post("/logout") as Promise<void>;
  }
}

export const authAPI = new AuthAPI();
