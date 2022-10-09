import { random } from '../random';

interface EmitterType {
  on: (event: string, func: any) => string;
  cancel: (id?: string) => void;
  emit: (event: string, ...args: any) => any;
  clear: () => void;
}

export class Emitter implements EmitterType {
  private readonly state: any = {};
  private readonly ids: any = {};

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
  }

  clear() {
    this.state.length = 0;
  }

  emit(event: string, ...args: any) {
    if (Array.isArray(this.state[event])) {
      for (const func of this.state[event]) {
        if (typeof func === 'function') {
          func(...args);
        }
      }
    }
  }
}
