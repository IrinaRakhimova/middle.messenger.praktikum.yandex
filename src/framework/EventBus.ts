export type EventHandler<T extends unknown[] = unknown[]> = (...args: T) => void;

export class EventBus<Events extends Record<string, unknown[]>> {
  private listeners: {
    [K in keyof Events]?: EventHandler<Events[K]>[];
  } = {};

  on<K extends keyof Events>(event: K, callback: EventHandler<Events[K]>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    this.listeners[event]?.forEach(callback => callback(...args));
  }
}
