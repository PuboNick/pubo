import { random } from '../random';

interface EmitterType {
  on: (event: string, func: any) => string;
  cancel: (id?: string) => void;
  emit: (event: string, payload?: any) => any;
  emitSync: (event: string, payload?: any) => Promise<any>;
  clear: () => void;
  clone: () => any;
  restore: (snapshot: any) => void;
}

export class Emitter implements EmitterType {
  private state: any = {};
  ids: any = {};

  on(event: string, func: any) {
    if (!this.state[event]) {
      this.state[event] = {};
    }
    if (typeof func !== 'function') {
      throw new Error('第二个参数必须为function!');
    }

    const key = `${random(40)}_${new Date().valueOf()}`;
    this.state[event][key] = func;
    this.ids[key] = event;
    return key;
  }

  cancel(id?: string) {
    if (!id) {
      return;
    }

    const event = this.ids[id];
    if (!event) {
      return;
    }
    if (!this.state[event]) {
      return;
    }
    delete this.state[event][id];
    if (Object.keys(this.state[event]).length === 0) {
      delete this.state[event];
    }
    delete this.ids[id];
  }

  clear() {
    this.state = {};
    this.ids = {};
  }

  emit(event: string, payload?: any) {
    if (this.state[event]) {
      for (const key of Object.keys(this.state[event])) {
        const func = this.state[event][key];
        if (typeof func === 'function') {
          func(payload);
        }
      }
    }
  }

  async emitSync(event: string, payload?: any) {
    if (this.state[event]) {
      for (const key of Object.keys(this.state[event])) {
        const func = this.state[event][key];
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

  emit(event: string, payload?: any): void {
    this._cache[event] = payload;
    super.emit(event, payload);
  }

  getState(event: string) {
    return this._cache[event];
  }
}
