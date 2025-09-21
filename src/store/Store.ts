import { EventBus } from "../framework/EventBus"; // assuming this is your EventBus
import { UserResponse } from "../api/authAPI";

export enum StoreEvents {
  UPDATED = 'updated',
}

interface State {
  user: UserResponse | null;
}

// Define the event map for our Store
interface StoreEventMap {
  [StoreEvents.UPDATED]: [state: State];
}

// The Store class extends the generic EventBus, providing its specific event map.
class Store extends EventBus<StoreEventMap> {
  private state: State = {
    user: null,
  };

  public getState() {
    return this.state;
  }

  public setUser(user: UserResponse | null) {
    this.state.user = user;
    this.emit(StoreEvents.UPDATED, this.state); // Emit the updated state
  }
}

export const store = new Store();