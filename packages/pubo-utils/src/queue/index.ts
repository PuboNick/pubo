export class SyncQueue {
  private readonly cache: any[] = [];
  private running = false;

  private async _run({ fn, promise }) {
    try {
      const res = await fn();
      promise.resolve(res);
    } catch (err) {
      promise.reject(err);
    }
  }

  private async run() {
    if (this.cache.length < 1) {
      this.running = false;
      return;
    } else {
      this.running = true;
    }
    const item = this.cache.shift();
    if (typeof item.fn === 'function') {
      await this._run(item);
    }
    this.run();
  }

  public push(fn) {
    return new Promise((resolve, reject) => {
      this.cache.push({ fn, promise: { resolve, reject } });
      if (!this.running) {
        this.run();
      }
    });
  }

  get length() {
    return this.cache.length;
  }
}
