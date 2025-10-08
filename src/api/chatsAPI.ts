import { HTTPTransport } from "./HTTPTransport";

const chatAPIInstance = new HTTPTransport("https://ya-praktikum.tech/api/v2");

export type Chat = {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message?: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  };
};

export type User = {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string | null;
  role?: string;
};

class ChatsAPI {
  async getChats(params?: { offset?: number; limit?: number; title?: string }) {
    const query = new URLSearchParams();
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.title) query.set("title", params.title);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return chatAPIInstance.get(`/chats${queryString}`) as Promise<Chat[]>;
  }

  async createChat(title: string) {
    return chatAPIInstance.post("/chats", { data: { title } }) as Promise<{ id: number }>;
  }

  async addUsers(chatId: number, userIds: number[]) {
    return chatAPIInstance.put("/chats/users", {
      data: { users: userIds, chatId },
    });
  }

  async removeUsers(chatId: number, userIds: number[]) {
    return chatAPIInstance.delete("/chats/users", {
      data: { users: userIds, chatId },
    });
  }

  async searchUsers(login: string) {
    return chatAPIInstance.post("/user/search", {
      data: { login },
    }) as Promise<User[]>;
  }

  async getChatUsers(
    chatId: number,
    params?: { offset?: number; limit?: number; name?: string; email?: string }
  ) {
    const query = new URLSearchParams();
    if (params?.offset !== undefined) query.set("offset", String(params.offset));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.name) query.set("name", params.name);
    if (params?.email) query.set("email", params.email);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return chatAPIInstance.get(`/chats/${chatId}/users${queryString}`) as Promise<User[]>;
  }
}

export const chatsAPI = new ChatsAPI();