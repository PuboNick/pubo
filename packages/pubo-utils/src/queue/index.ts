export class SyncQueue {
  private readonly cache: any[] = [];
  private running = false;
  private len = 0;

  private async _run({ fn, promise }) {
    try {
      const res = await fn();
      promise.resolve(res);
    } catch (err) {
      promise.reject(err);
    }
    fn = null;
    promise = null;
  }

  private async run() {
    if (this.cache.length < 1) {
      this.running = false;
      return;
    } else {
      this.running = true;
    }
    const item = this.cache.shift();
    this.len -= 1;
    if (typeof item.fn === 'function') {
      await this._run(item);
    }
    this.run();
  }

  public push(fn) {
    this.len += 1;

    return new Promise((resolve, reject) => {
      this.cache.push({ fn, promise: { resolve, reject } });
      if (!this.running) {
        this.run();
      }
    });
  }

  get length() {
    return this.len;
  }
}

export const runAsyncTasks = async (list, j = 4) => {
  let i = -1;
  const t: any[] = [];

  const run = async () => {
    i += 1;
    if (!list[i]) {
      return;
    }

    try {
      await list[i]();
    } catch (err) {
      console.log(err);
    }
    await run();
  };

  for (let n = 0; n < j; n += 1) {
    t.push(run());
  }

  await Promise.all(t);
};
