import { random } from '../random';

type Callback<T = unknown> = (payload: T) => void | Promise<void>;

interface EmitterSnapshot {
  state: Record<string, Record<string, Callback>>;
  ids: Record<string, string>;
}

interface EmitterType {
  on: <T = unknown>(event: string, func: Callback<T>) => string;
  cancel: (id?: string) => void;
  emit: <T = unknown>(event: string, payload?: T) => void;
  emitAsync: <T = unknown>(event: string, payload?: T) => Promise<void>;
  clear: () => void;
  clone: () => EmitterSnapshot;
  restore: (snapshot: EmitterSnapshot) => void;
}

export class Emitter implements EmitterType {
  private state: Record<string, Record<string, Callback>> = {};
  private ids: Record<string, string> = {};

  on<T = unknown>(event: string, func: Callback<T>): string {
    if (!this.state[event]) {
      this.state[event] = {};
    }
    if (typeof func !== 'function') {
      throw new Error('第二个参数必须为function!');
    }

    const key = `${random(40)}_${Date.now()}`;
    this.state[event][key] = func as Callback;
    this.ids[key] = event;
    return key;
  }

  cancel(id?: string): void {
    if (!id) {
      return;
    }

    const event = this.ids[id];
    if (!event || !this.state[event]) {
      return;
    }
    delete this.state[event][id];
    if (Object.keys(this.state[event]).length === 0) {
      delete this.state[event];
    }
    delete this.ids[id];
  }

  clear(): void {
    this.state = {};
    this.ids = {};
  }

  emit<T = unknown>(event: string, payload?: T): void {
    const handlers = this.state[event];
    if (handlers) {
      for (const key of Object.keys(handlers)) {
        const func = handlers[key];
        if (typeof func === 'function') {
          func(payload);
        }
      }
    }
  }

  async emitAsync<T = unknown>(event: string, payload?: T): Promise<void> {
    const handlers = this.state[event];
    if (handlers) {
      for (const key of Object.keys(handlers)) {
        const func = handlers[key];
        if (typeof func === 'function') {
          try {
            await func(payload);
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  }

  clone(): EmitterSnapshot {
    return { state: { ...this.state }, ids: { ...this.ids } };
  }

  restore(snapshot: EmitterSnapshot): void {
    this.state = snapshot.state;
    this.ids = snapshot.ids;
  }
}

export class CacheEmitter extends Emitter {
  private readonly _cache: Record<string, unknown> = {};

  emit<T = unknown>(event: string, payload?: T): void {
    this._cache[event] = payload;
    super.emit(event, payload);
  }

  getState<T = unknown>(event: string): T | undefined {
    return this._cache[event] as T | undefined;
  }
}
