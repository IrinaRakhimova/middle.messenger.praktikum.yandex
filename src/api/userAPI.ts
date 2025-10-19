import { HTTPTransport } from "./HTTPTransport";
import { UserResponse } from "./authAPI";
import { BASE_URL } from "../utils/constants";

const userAPIInstance = new HTTPTransport(
  `${BASE_URL}/user`
);

export type UserUpdateRequest = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

export type PasswordUpdateRequest = {
  oldPassword: string;
  newPassword: string;
};

class UserAPI {
  async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
    return (await userAPIInstance.put("/profile", {
      data,
    })) as Promise<UserResponse>;
  }

  async updateAvatar(data: FormData): Promise<UserResponse> {
    return (await userAPIInstance.put("/profile/avatar", {
      data,
      headers: {},
    })) as Promise<UserResponse>;
  }

  async updatePassword(data: PasswordUpdateRequest): Promise<void> {
    await userAPIInstance.put("/password", {
      data,
    });
  }
}

export const userAPI = new UserAPI();
