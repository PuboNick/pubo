import { random } from '../random';

interface EmitterType {
  on: (event: string, func: any) => string;
  cancel: (id?: string) => void;
  emit: (event: string, ...args: any) => any;
  clear: () => void;
  clone: () => any;
  restore: (snapshot: any) => void;
}

export class Emitter implements EmitterType {
  private state: any = {};
  private ids: any = {};

  on(event: string, func: any) {
    if (!this.state[event]) {
      this.state[event] = [];
    }
    if (typeof func !== 'function') {
      throw new Error('第二个参数必须为function!');
    }
    const index = this.state[event].push(func) - 1;
    const key = random(40);
    this.ids[key] = { event, index };
    return key;
  }

  cancel(id?: string) {
    if (!id) {
      this.clear();
      return;
    }
    const { event, index } = this.ids[id] || {};
    if (!event) {
      return;
    }
    if (!Array.isArray(this.state[event])) {
      return;
    }
    this.state[event].splice(index, 1);
    delete this.ids[id];
    Object.keys(this.ids).forEach((key) => {
      if (this.ids[key].event === event && this.ids[key].index > index) {
        this.ids[key].index = this.ids[key].index - 1;
      }
    });
  }

  clear() {
    this.state.length = 0;
  }

  emit(event: string, payload: any) {
    if (Array.isArray(this.state[event])) {
      for (const func of this.state[event]) {
        if (typeof func === 'function') {
          func(payload);
        }
      }
    }
  }

  async emitSync(event: string, payload: any) {
    if (Array.isArray(this.state[event])) {
      for (const func of this.state[event]) {
        if (typeof func === 'function') {
          await func(payload);
        }
      }
    }
  }

  clone() {
    return { state: { ...this.state }, ids: { ...this.ids } };
  }

  restore(snapshot) {
    this.state = snapshot.state;
    this.ids = snapshot.ids;
  }
}

export class CacheEmitter extends Emitter {
  private readonly _cache: any = {};

  emit(event: string, payload: any): void {
    this._cache[event] = payload;
    super.emit(event, payload);
  }

  getState(event: string) {
    return this._cache[event];
  }
}
