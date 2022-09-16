import { sleep } from '../sleep';

export const loop = (cb: (stop: () => void) => Promise<void>, time: number) => {
  let onOff = true;
  const stop = () => {
    onOff = false;
  };

  let fn: any = async () => {
    await cb(stop);
    await sleep(time);
    if (onOff) {
      fn();
    } else {
      fn = null;
    }
  };
  fn();

  return stop;
};

type WaitForBool = () => boolean | Promise<boolean>;

export const waitFor = (bool: WaitForBool, { checkTime, timeout }: { checkTime?: number; timeout?: number } = {}) => {
  return new Promise((resolve, reject) => {
    const stop = loop(async () => {
      const res = await bool();
      if (res) {
        stop();
        resolve(res);
      }
    }, checkTime || 100);

    if (timeout) {
      setTimeout(() => {
        stop();
        reject('timeout');
      }, timeout);
    }
  });
};
