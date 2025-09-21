import { HTTPTransport } from "./HTTPTransport";
import { UserResponse } from "./authAPI";

const userAPIInstance = new HTTPTransport(
  "https://ya-praktikum.tech/api/v2/user"
);

export type UserUpdateRequest = {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
};

class UserAPI {
  async updateProfile(data: UserUpdateRequest): Promise<UserResponse> {
    return (await userAPIInstance.put("/profile", {
      data,
    })) as Promise<UserResponse>;
  }
}

export const userAPI = new UserAPI();