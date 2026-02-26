export class SyncQueue {
  private readonly cache: Array<{
    fn: () => Promise<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];
  private running = false;

  private async _run(item: (typeof this.cache)[0]) {
    try {
      const res = await item.fn();
      item.resolve(res);
    } catch (err) {
      item.reject(err);
    }
  }

  private async run() {
    if (this.cache.length < 1) {
      this.running = false;
      return;
    }
    this.running = true;
    const item = this.cache.shift();
    if (item) {
      await this._run(item);
    }
    this.run();
  }

  public push<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.cache.push({ fn, resolve, reject });
      if (!this.running) {
        this.run();
      }
    });
  }

  get length(): number {
    return this.cache.length;
  }
}

export const runAsyncTasks = async (tasks: Array<() => Promise<unknown>>, concurrency = 4): Promise<void> => {
  let index = -1;

  const run = async (): Promise<void> => {
    index += 1;
    const task = tasks[index];
    if (!task) {
      return;
    }
    try {
      await task();
    } catch (err) {
      console.log(err);
    }
    await run();
  };

  const workers = Array.from({ length: concurrency }, () => run());
  await Promise.all(workers);
};
