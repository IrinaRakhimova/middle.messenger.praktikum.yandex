type ChatMessage = {
  id?: number;
  user_id: number;
  chat_id: number;
  time: string;
  type: "message" | "file" | "sticker";
  content: string;
  file?: any;
};

export class ChatWebSocket {
  private socket: WebSocket | null = null;
  private pingInterval: number | null = null;

  constructor(private userId: number, private chatId: number, private token: string) { }

  connect(onMessage: (msg: ChatMessage | ChatMessage[]) => void) {
    this.socket = new WebSocket(
      `wss://ya-praktikum.tech/ws/chats/${this.userId}/${this.chatId}/${this.token}`
    );

    this.socket.addEventListener("open", () => {
      console.log("WS connected to chat", this.chatId);
      this.send({ type: "get old", content: "0" });
      this.pingInterval = window.setInterval(() => {
        this.send({ type: "ping" });
      }, 30000);
    });

    this.socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;

      try {
        const data = JSON.parse(event.data);

        if (Array.isArray(data)) {
          const filtered = data.filter(
            (msg) => msg.type === "message" || msg.type === "file" || msg.type === "sticker"
          );
          if (filtered.length) onMessage(filtered);
        } else if (data.type === "message" || data.type === "file" || data.type === "sticker") {
          onMessage(data);
        }
      } catch (e) {
        console.warn("Ignored non-JSON WS message:", event.data);
      }
    });

    this.socket.addEventListener("close", () => {
      if (this.pingInterval) clearInterval(this.pingInterval);
    });
  }

  send(payload: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }

  sendMessage(text: string) {
    this.send({ type: "message", content: text });
  }

  disconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.socket?.close();
  }
}