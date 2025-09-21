export type EventHandler<T extends unknown[] = unknown[]> = (...args: T) => void;

export class EventBus<Events extends Record<keyof Events, unknown[]>> {
  private listeners: {
    [K in keyof Events]?: EventHandler<Events[K]>[];
  } = {};

  on<K extends keyof Events>(event: K, callback: EventHandler<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  off<K extends keyof Events>(event: K, callback: EventHandler<Events[K]>): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event as string}`);
    }

    this.listeners[event] = this.listeners[event]!.filter(
      (listener) => listener !== callback
    );
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners[event]?.forEach(callback => callback(...args));
  }
}