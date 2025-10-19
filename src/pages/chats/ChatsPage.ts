import { Block } from "../../framework/Block";
import template from "./chats.hbs?raw";
import { ChatItem } from "../../components/chat-item/chat-item";
import { Input } from "../../components/input/input";
import { Button } from "../../components/button/button";
import { Modal } from "../../components/modal/modal";
import { MessageBubble } from "../../components/message-bubble/message-bubble";
import "./chats.css";
import { ChatWebSocket } from "../../api/chatWebSocket";
import { chatsAPI } from "../../api/chatsAPI";
import { BASE_URL } from "../../utils/constants";


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
      type: "submit",
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
      const res = await fetch(`${BASE_URL}/chats`, {
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

    const meRes = await fetch(`${BASE_URL}/auth/user`, {
      credentials: "include",
    });
    const me = await meRes.json();
    this.currentUserId = me.id;

    const tokenRes = await fetch(`${BASE_URL}/chats/token/${chatId}`, {
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
      const p = document.createElement("p");
      p.textContent = "Чат не выбран";
      noChatDiv.appendChild(p);
      dynamicContentArea.appendChild(noChatDiv);
      return;
    }

    const chatHeader = document.createElement("div");
    chatHeader.classList.add("chat-header");
    chatHeader.id = "chat-title";
    const span = document.createElement("span");
    span.textContent = this.currentChat.title;
    chatHeader.appendChild(span);

    const headerButtons = document.createElement("div");
    headerButtons.classList.add("chat-header-buttons");

    const addUserButton = new Button({
      label: "➕ Добавить",
      type: "button",
      onClick: () => this.openAddUsersModal(),
    });

    const viewUsersButton = new Button({
      label: "👥 Пользователи",
      type: "button",
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

    dynamicContentArea.appendChild(form);

    this.addEventListener(form, "submit", (e) => {
      e.preventDefault();
      this.handleSend();
    });
    const inputEl = this.messageInput.getContent()?.querySelector("input[name='message']") as HTMLInputElement;
    const sendBtnEl = this.sendButton.getContent()?.querySelector("button") as HTMLButtonElement;

    if (inputEl && sendBtnEl) {
      inputEl.addEventListener("input", () => {
        const value = inputEl.value.trim();
        if (value) {
          sendBtnEl.disabled = false;
          sendBtnEl.classList.remove("disabled-btn");
          inputEl.setCustomValidity("");
        } else {
          sendBtnEl.disabled = true;
          sendBtnEl.classList.add("disabled-btn");
          inputEl.setCustomValidity("Введите сообщение");
        }
      });
    }
  }
  private handleSend(): void {
    const inputEl = this.messageInput.getContent()?.querySelector("input[name='message']") as HTMLInputElement;
    if (!inputEl) return;

    const value = inputEl.value.trim();
    if (!value) return;

    if (this.chatWS && this.currentChatId) {
      this.chatWS.sendMessage(value);
    }

    inputEl.value = "";
    inputEl.dispatchEvent(new Event("input"));
  }


  private addMessage(msg: ChatMessage): void {
    const messageList = this.getContent()?.querySelector("#messages");
    if (!messageList) return;

    const isIncoming = msg.user_id !== this.currentUserId;

    const bubble = new MessageBubble({
      time: new Date(msg.time).toLocaleTimeString(),
      text: msg.content,

      incoming: isIncoming,
    });

    messageList.appendChild(bubble.getContent()!);
    bubble.afterRender?.();

    messageList.scrollTop = messageList.scrollHeight;
  }

  private async openUsersModal(chatId: number): Promise<void> {
    try {
      const users = await chatsAPI.getChatUsers(chatId);

      if (!this.currentUserId) {
        const meRes = await fetch(`${BASE_URL}/auth/user`, {
          credentials: "include",
        });
        const me = await meRes.json();
        this.currentUserId = me.id;
      }

      const modalContent = document.createElement("div");
      modalContent.classList.add("chat-users-modal");

      modalContent.innerHTML = "";

      const title = document.createElement("h3");
      title.classList.add("chat-users-title");
      title.textContent = `Пользователи чата "${this.currentChat?.title || ""}"`;
      modalContent.appendChild(title);

      const list = document.createElement("ul");
      list.classList.add("chat-users-list");

      users.forEach((u) => {
        const isSelf = u.id === this.currentUserId;

        const li = document.createElement("li");
        li.classList.add("chat-user-item");
        li.dataset.userId = String(u.id);

        const infoDiv = document.createElement("div");

        const name = document.createElement("span");
        name.classList.add("chat-user-name");
        name.textContent = u.display_name || u.login;

        const idSpan = document.createElement("span");
        idSpan.classList.add("chat-user-id");
        idSpan.textContent = `ID: ${u.id}`;

        infoDiv.appendChild(name);
        infoDiv.appendChild(idSpan);

        if (isSelf) {
          const selfSpan = document.createElement("span");
          selfSpan.classList.add("chat-user-self");
          selfSpan.textContent = "(Вы)";
          infoDiv.appendChild(selfSpan);
        }

        li.appendChild(infoDiv);

        const button = document.createElement("button");
        button.classList.add("remove-user-btn");
        button.dataset.userId = String(u.id);

        if (isSelf) {
          button.disabled = true;
          button.style.opacity = "0.5";
          button.style.cursor = "not-allowed";
        }

        button.textContent = "Удалить";
        li.appendChild(button);

        list.appendChild(li);
      });

      modalContent.appendChild(list);

      const modal = new Modal({
        content: modalContent.outerHTML,
        onClose: () => console.log("Users modal closed"),
      });

      modal.show();

      setTimeout(() => {
        document.querySelectorAll(".remove-user-btn:not([disabled])").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const userId = Number(target.dataset.userId);
            if (!userId) return;

            if (confirm("Удалить пользователя из чата?")) {
              try {
                await chatsAPI.removeUsers(chatId, [userId]);
                target.closest(".chat-user-item")?.remove();
              } catch (err) {
                console.error("Ошибка при удалении пользователя:", err);
                alert("Не удалось удалить пользователя");
              }
            }
          });
        });
      }, 0);
    } catch (error) {
      console.error("Ошибка при получении пользователей чата:", error);
    }
  }

  private async openAddUsersModal(): Promise<void> {
    const searchInput = new Input({
      type: "text",
      name: "user-search",
      label: "Поиск пользователей",
    });

    const resultsList = document.createElement("ul");
    resultsList.id = "user-search-results";
    resultsList.classList.add("user-search-results");

    const infoMessage = document.createElement("p");
    infoMessage.classList.add("user-search-message");
    infoMessage.textContent = "Введите что-нибудь для поиска";

    const modal = new Modal({
      content: "",
      onClose: () => console.log("Add/remove users modal closed"),
    });

    modal.show();

    const modalContent = modal.getContent()?.querySelector(".modal-content");
    if (!modalContent) return;

    modalContent.appendChild(searchInput.getContent()!);
    modalContent.appendChild(infoMessage);
    modalContent.appendChild(resultsList);
    searchInput.afterRender?.();

    const currentUsers = await chatsAPI.getChatUsers(this.currentChatId!);
    const currentUserIds = currentUsers.map((u: any) => u.id);

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
        resultsList.innerHTML = "";
        if (!value) {
          infoMessage.textContent = "Введите что-нибудь для поиска";
          infoMessage.style.display = "block";
          return;
        }

        try {
          const users = await chatsAPI.searchUsers(value);
          resultsList.innerHTML = "";
          if (!Array.isArray(users) || users.length === 0) {
            infoMessage.textContent = "Пользователи не найдены";
            infoMessage.style.display = "block";
            return;
          }

          infoMessage.style.display = "none";

          users.forEach((u) => {
            const isInChat = currentUserIds.includes(u.id);
            const isMe = u.id === this.currentUserId;
            const buttonLabel = isMe ? "Вы" : isInChat ? "Удалить" : "Добавить";
            const buttonClass = isMe ? "disabled-btn" : isInChat ? "remove-user-btn" : "add-user-btn";

            const li = document.createElement("li");
            li.classList.add("user-result");
            li.dataset.id = String(u.id);

            const nameSpan = document.createElement("span");
            nameSpan.classList.add("user-result-name");
            nameSpan.textContent = u.display_name || u.login;

            const button = document.createElement("button");
            button.classList.add(buttonClass);
            button.dataset.id = String(u.id);
            button.textContent = buttonLabel;
            if (isMe) {
              button.disabled = true;
            }

            button.addEventListener("click", async () => {
              const id = u.id;
              if (!this.currentChatId || !id || isMe) return;

              if (currentUserIds.includes(id)) {
                if (confirm("Удалить пользователя из чата?")) {
                  try {
                    await chatsAPI.removeUsers(this.currentChatId, [id]);
                    alert("Пользователь удалён!");
                    button.textContent = "Добавить";
                    button.classList.remove("remove-user-btn");
                    button.classList.add("add-user-btn");
                    const idx = currentUserIds.indexOf(id);
                    if (idx !== -1) currentUserIds.splice(idx, 1);
                  } catch (err) {
                    console.error("Ошибка удаления пользователя:", err);
                  }
                }
              } else {
                try {
                  await chatsAPI.addUsers(this.currentChatId, [id]);
                  alert("Пользователь добавлен!");
                  button.textContent = "Удалить";
                  button.classList.remove("add-user-btn");
                  button.classList.add("remove-user-btn");
                  currentUserIds.push(id);
                } catch (err) {
                  console.error("Ошибка добавления пользователя:", err);
                }
              }
            });

            li.appendChild(nameSpan);
            li.appendChild(button);
            resultsList.appendChild(li);
          });
        } catch (err) {
          console.error("Ошибка поиска:", err);
          resultsList.innerHTML = "";
          infoMessage.textContent = "Ошибка при поиске пользователей";
          infoMessage.style.display = "block";
        }
      }, 400)
    );
  }
  private bindCreateChatButton(): void {
    const createChatBtn = new Button({
      label: "Создать чат",
      type: "button",
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
      type: "button",
      onClick: async () => {
        const inputEl = input.getContent()?.querySelector("input[name='chat-title']") as HTMLInputElement;
        const title = inputEl?.value.trim();
        if (!title) return;

        await fetch(`${BASE_URL}/chats`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });

        modal.close();
        this.loadChats?.();
      },
    });

    const modal = new Modal({ content: "" });
    modal.show();

    const modalContent = modal.getContent()?.querySelector(".modal-content");
    if (modalContent) {
      modalContent.appendChild(input.getContent()!);
      modalContent.appendChild(confirmButton.getContent()!);
      input.afterRender?.();
      confirmButton.afterRender?.();
    }
  }
}
