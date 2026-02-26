import { sleep } from '../sleep';

/**
 * Executes the given callback function in a loop with the specified time interval.
 *
 * @param {Function} cb - The callback function to be executed in the loop. It takes a stop function as a parameter.
 * @param {number} time - The time interval in milliseconds for the loop.
 * @return {Function} The stop function that can be used to stop the loop.
 */

export const loop = (cb: () => Promise<void>, time: number) => {
  let onOff = true;
  let stop = () => (onOff = false);

  (async () => {
    while (onOff) {
      try {
        await cb();
      } catch (err) {
        console.log(err);
      }
      await sleep(time);
    }
  })();

  return stop;
};

type WaitForBool = () => boolean | Promise<boolean>;

/**
 * Waits for a boolean condition to be true, with optional timeouts for the check and the overall wait.
 *
 * @param {WaitForBool} bool - the boolean condition to wait for
 * @param {Object} options - optional parameters for checkTime and timeout
 * @param {number} options.checkTime - the time interval for checking the boolean condition (default is 100)
 * @param {number} options.timeout - the maximum time to wait for the boolean condition to be true
 * @return {Promise<any>} a promise that resolves when the boolean condition is true or rejects with 'timeout' if the timeout is reached
 */
export const waitFor = (bool: WaitForBool, { checkTime, timeout }: { checkTime?: number; timeout?: number } = {}) => {
  return new Promise((resolve, reject) => {
    let _timeout;
    let stop: any = loop(async () => {
      const res = await bool();
      if (res) {
        if (typeof stop === 'function') {
          stop();
        }
        if (_timeout) {
          clearTimeout(_timeout);
          _timeout = null;
        }
        resolve(res);

        stop = null;
        (bool as any) = null;
        (resolve as any) = null;
      }
    }, checkTime || 100);

    if (timeout) {
      _timeout = setTimeout(() => {
        if (typeof stop === 'function') {
          stop();
        }

        if (_timeout) {
          clearTimeout(_timeout);
          _timeout = null;
        }

        reject('timeout');
        (reject as any) = null;
        stop = null;
        (bool as any) = null;
      }, timeout);
    }
  });
};

export const retry = async <T>(
  action: () => Promise<T>,
  { times = 5, interval = 1000 }: { times?: number; interval?: number } = {},
): Promise<T> => {
  let count = 1;
  const fn = async (): Promise<T> => {
    if (count > times) {
      throw new Error('retry times exceed');
    }
    try {
      return await action();
    } catch (err) {
      console.log(`action error, times ${count}`);
      console.log(err);
      await sleep(interval);
      count += 1;
      return fn();
    }
  };
  return fn();
};

export class RetryPlus {
  times: number;
  interval: number;
  action: any;

  private count = 1;
  private args: any[] = [];
  private result: any;
  private canceled: boolean = false;

  constructor(
    action,
    { times = 5, interval = 1000 }: { times: number; interval: number } = { times: 5, interval: 1000 },
  ) {
    this.interval = interval;
    this.times = times;
    this.action = action;
  }

  private async _run() {
    if (this.canceled) {
      throw new Error('retry canceled');
    }
    if (this.count > this.times) {
      throw new Error('retry times exceed');
    }
    try {
      this.result = await this.action(...this.args);
    } catch (err) {
      console.log(`action error, times ${this.count}`);
      console.log(err);
      await sleep(this.interval);
      this.count += 1;
      await this._run();
    }
  }

  async run(...args: any[]) {
    this.canceled = false;
    this.result = null;
    this.count = 1;
    this.args = args;
    await this._run();
    this.args = [];
    this.count = 1;
    return this.result;
  }

  async cancel() {
    this.canceled = true;
  }
}

export interface RemoteControlOptions {
  start: (payload?: any) => void;
  stop: (payload?: any) => void;
  fps?: number;
}

export class RemoteControl {
  private timeout: any;
  private _start: (payload?: any) => void;
  private _stop: (payload?: any) => void;
  private readonly fps: number;
  private payload: any;

  constructor({ start, stop, fps = 5 }) {
    this._start = start;
    this._stop = stop;
    this.fps = fps;
  }

  private send() {
    if (!this.payload) return;
    this._start(this.payload);
  }

  public control(payload: any) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.payload = payload;
    this.send();
    this.timeout = setTimeout(() => this.stop(), 1000 / this.fps);
  }

  public stop() {
    this.payload = null;
    clearTimeout(this.timeout);
    this.timeout = null;
    this._stop();
  }
}
