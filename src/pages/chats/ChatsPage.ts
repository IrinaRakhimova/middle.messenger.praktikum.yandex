import { Block } from "../../framework/Block";
import template from "./chats.hbs?raw";
import { ChatItem } from "../../components/chat-item/chat-item";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import { Modal } from "../../components/modal/modal";
import { MessageBubble } from "../../components/message-bubble/message-bubble";
import "./chats.css";
import { validateField } from "../../utils/validation";
import { ChatWebSocket } from "../../api/chatWebSocket";
import { chatsAPI } from "../../api/chatsAPI";


type ChatMessage = {
  id?: number;
  user_id: number;
  chat_id: number;
  time: string;
  type: "message" | "file" | "sticker";
  content: string;
  file?: any;
};

export class ChatsPage extends Block {
  private chats: any[] = [];

  private messageInput!: Input;
  private sendButton!: Button;
  private chatWS: ChatWebSocket | null = null;
  private currentChatId: number | null = null;
  private currentChat: any | null = null;
  private currentUserId: number | null = null;

  constructor() {
    const messageInput = new Input({
      type: "text",
      name: "message",
      label: "Сообщение",
      value: "",
    });

    const sendButton = new Button({
      label: "Send",
      onClick: () => this.handleSend(),
    });

    super({ chatList: "", messageList: "" });

    this.messageInput = messageInput;
    this.sendButton = sendButton;
  }

  public afterRender(): void {
    super.afterRender?.();
    this.bindChatClicks();
    this.bindCreateChatButton();
    this.loadChats();
    this.renderChatArea();
  }

  protected componentWillUnmount(): void {
    this.chatWS?.disconnect();
  }

  protected render(): string {
    return template;
  }

  private async loadChats(): Promise<void> {
    try {
      const res = await fetch("https://ya-praktikum.tech/api/v2/chats", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chats");

      const chats = await res.json();
      this.chats = chats;

      const chatListEl = this.getContent()?.querySelector(".chat-list");
      if (!chatListEl) return;

      chatListEl.innerHTML = "";
      chats.forEach((chat: any) => {
        const chatItem = new ChatItem({
          id: chat.id,
          name: chat.title,
          time: chat.last_message ? new Date(chat.last_message.time).toLocaleTimeString() : "",
          lastMessage: chat.last_message ? chat.last_message.content : "",
          unread: chat.unread_count || 0,
        });

        chatListEl.appendChild(chatItem.getContent()!);
        chatItem.afterRender?.();
      });

      this.bindChatClicks();
    } catch (err) {
      console.error(err);
    }
  }

  private bindChatClicks(): void {
    const chatEls = this.getContent()?.querySelectorAll(".chat-item");
    chatEls?.forEach((el) => {
      this.addEventListener(el, "click", () => {
        const chatId = Number(el.getAttribute("data-id"));
        const chat = this.chats.find((c) => c.id === chatId);
        if (!chat) return;
        this.currentChat = chat;
        this.openChat(chatId);
      });
    });
  }

  private async openChat(chatId: number): Promise<void> {
    this.currentChatId = chatId;

    const chatEls = this.getContent()?.querySelectorAll(".chat-item");
    chatEls?.forEach((el) => {
      if (Number(el.getAttribute("data-id")) === chatId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });

    const meRes = await fetch("https://ya-praktikum.tech/api/v2/auth/user", {
      credentials: "include",
    });
    const me = await meRes.json();
    this.currentUserId = me.id;

    const tokenRes = await fetch(`https://ya-praktikum.tech/api/v2/chats/token/${chatId}`, {
      method: "POST",
      credentials: "include",
    });
    const { token } = await tokenRes.json();

    this.chatWS?.disconnect();

    this.chatWS = new ChatWebSocket(me.id, chatId, token);
    this.chatWS.connect((msg) => {
      if (Array.isArray(msg)) msg.reverse().forEach((m) => this.addMessage(m));
      else this.addMessage(msg);
    });

    this.renderChatArea();
  }

  private renderChatArea(): void {
    const dynamicContentArea = this.getContent()?.querySelector("#dynamic-content-area");
    if (!dynamicContentArea) return;
    dynamicContentArea.innerHTML = "";

    if (!this.currentChatId || !this.currentChat) {
      const noChatDiv = document.createElement("div");
      noChatDiv.classList.add("no-chat-selected");
      noChatDiv.innerHTML = "<p>Чат не выбран</p>";
      dynamicContentArea.appendChild(noChatDiv);
      return;
    }

    const chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header");
    chatHeader.id = "chat-title";
    chatHeader.innerHTML = `<span>${this.currentChat.title}</span>`;

    const headerButtons = document.createElement("div");
    headerButtons.classList.add("chat-header-buttons");

    const addUserButton = new Button({
      label: "➕ Добавить",
      onClick: () => this.openAddUsersModal(),
    });

    const viewUsersButton = new Button({
      label: "👥 Пользователи",
      onClick: () => {
        if (this.currentChatId) this.openUsersModal(this.currentChatId);
      },
    });

    headerButtons.appendChild(addUserButton.getContent()!);
    headerButtons.appendChild(viewUsersButton.getContent()!);
    addUserButton.afterRender?.();
    viewUsersButton.afterRender?.();
    chatHeader.appendChild(headerButtons);
    dynamicContentArea.appendChild(chatHeader);

    const messagesDiv = document.createElement("div");
    messagesDiv.classList.add("messages");
    messagesDiv.id = "messages";
    dynamicContentArea.appendChild(messagesDiv);

    const form = document.createElement("form");
    form.id = "chat-form";
    form.classList.add("chat-form");
    form.appendChild(this.messageInput.getContent()!);
    form.appendChild(this.sendButton.getContent()!);
    this.messageInput.afterRender?.();
    this.sendButton.afterRender?.();

    this.addEventListener(form, "submit", (e) => {
      e.preventDefault();
      this.handleSend();
    });

    dynamicContentArea.appendChild(form);
  }

  private handleSend(): void {
    const inputEl = this.messageInput.getContent()?.querySelector("input[name='message']") as HTMLInputElement;
    const value = inputEl?.value.trim() || "";

    const { valid, error } = validateField("message", value);
    if (!valid) {
      inputEl?.classList.add("input-error");
      inputEl?.setCustomValidity(error || "Ошибка");
      inputEl?.reportValidity();
      return;
    }

    inputEl?.classList.remove("input-error");
    inputEl?.setCustomValidity("");

    if (value && this.chatWS && this.currentChatId) {
      this.chatWS.sendMessage(value);
    }

    if (inputEl) inputEl.value = "";
  }

  private addMessage(msg: ChatMessage): void {
    const messageList = this.getContent()?.querySelector("#messages");
    if (!messageList) return;

    const isIncoming = msg.user_id !== this.currentUserId;

    const bubble = new MessageBubble({
      text: msg.content,
      time: new Date(msg.time).toLocaleTimeString(),
      incoming: isIncoming,
    });

    messageList.appendChild(bubble.getContent()!);
    bubble.afterRender?.();

    messageList.scrollTop = messageList.scrollHeight;
  }

  private async openUsersModal(chatId: number): Promise<void> {
    try {
      const users = await chatsAPI.getChatUsers(chatId);

      const modalContent = `
      <div class="chat-users-modal">
        <h3 class="chat-users-title">
          Пользователи чата "<span class="chat-title-name">${this.currentChat?.title}</span>"
        </h3>
        <ul class="chat-users-list">
          ${users
          .map(
            (u) => `
              <li class="chat-user-item">
                <span class="chat-user-name">${u.display_name || u.login}</span>
                <span class="chat-user-id">ID: ${u.id}</span>
              </li>`
          )
          .join("")}
        </ul>
      </div>
    `;

      const modal = new Modal({
        content: modalContent,
        onClose: () => console.log("Users modal closed"),
      });

      modal.show();
    } catch (error) {
      console.error("Ошибка при получении пользователей чата:", error);
    }
  }

  private openAddUsersModal(): void {
    const searchInput = new Input({
      type: "text",
      name: "user-search",
      label: "Поиск пользователей",
    });

    const resultsList = document.createElement("ul");
    resultsList.id = "user-search-results";
    resultsList.classList.add("user-search-results");

    const modal = new Modal({
      content: "",
      onClose: () => console.log("Add users modal closed"),
    });

    modal.show();

    const modalContent = modal.getContent()?.querySelector(".modal-content");
    if (!modalContent) return;

    modalContent.appendChild(searchInput.getContent()!);
    modalContent.appendChild(resultsList);
    searchInput.afterRender?.();

    let debounceTimer: number | undefined;
    const debounce = (fn: (...args: any[]) => void, delay: number) => {
      return (...args: any[]) => {
        clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => fn(...args), delay);
      };
    };

    const inputEl = searchInput.getContent()?.querySelector("input") as HTMLInputElement;
    inputEl.addEventListener(
      "input",
      debounce(async (e: Event) => {
        const value = (e.target as HTMLInputElement).value.trim();
        if (!value) {
          resultsList.innerHTML = "";
          return;
        }

        try {
          const users = await chatsAPI.searchUsers(value);
          if (!Array.isArray(users)) return;

          resultsList.innerHTML = users
            .map(
              (u) => `
            <li data-id="${u.id}" class="user-result">
              ${u.display_name || u.login}
              <button class="add-user-btn" data-id="${u.id}">Добавить</button>
            </li>`
            )
            .join("");

          resultsList.querySelectorAll(".add-user-btn").forEach((btn) => {
            btn.addEventListener("click", async (ev) => {
              const id = Number((ev.target as HTMLElement).getAttribute("data-id"));
              if (this.currentChatId && id) {
                await chatsAPI.addUsers(this.currentChatId, [id]);
                alert("Пользователь добавлен!");
                modal.close();
              }
            });
          });
        } catch (err) {
          console.error("Ошибка поиска:", err);
        }
      }, 400)
    );
  }

  private bindCreateChatButton(): void {
    const createChatBtn = new Button({
      label: "Создать чат",
      onClick: () => this.openCreateChatModal(),
    });

    const sidebarHeader = this.getContent()?.querySelector(".sidebar-header");
    if (sidebarHeader) {
      sidebarHeader.appendChild(createChatBtn.getContent()!);
      createChatBtn.afterRender?.();
    }
  }

  private openCreateChatModal(): void {
    const input = new Input({ type: "text", name: "chat-title", label: "Название чата" });
    const confirmButton = new Button({
      label: "Создать",
      onClick: async () => {
        const inputEl = input.getContent()?.querySelector("input[name='chat-title']") as HTMLInputElement;
        const title = inputEl?.value.trim();
        if (!title) return;

        await fetch("https://ya-praktikum.tech/api/v2/chats", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });

        modal.close();
        this.loadChats?.();
      },
    });

    const contentContainer = document.createElement("div");
    contentContainer.appendChild(input.getContent()!);
    contentContainer.appendChild(confirmButton.getContent()!);

    const modal = new Modal({ content: "" });
    modal.show();
    const modalContent = modal.getContent()?.querySelector(".modal-content");
    if (modalContent) {
      modalContent.appendChild(input.getContent()!);
      modalContent.appendChild(confirmButton.getContent()!);
    }
    input.afterRender?.();
    confirmButton.afterRender?.();
  }
}