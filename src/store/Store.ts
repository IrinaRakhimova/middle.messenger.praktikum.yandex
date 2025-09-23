import { EventBus } from "../framework/EventBus";
import { UserResponse } from "../api/authAPI";

export enum StoreEvents {
  UPDATED = 'updated',
}

interface State {
  user: UserResponse | null;
}

interface StoreEventMap {
  [StoreEvents.UPDATED]: [state: State];
}

class Store extends EventBus<StoreEventMap> {
  private state: State = {
    user: null,
  };

  public getState() {
    return this.state;
  }

  public setUser(user: UserResponse | null) {
    this.state.user = user ? { ...user } : null;

    this.emit(StoreEvents.UPDATED, { ...this.state });
  }
}

export const store = new Store();