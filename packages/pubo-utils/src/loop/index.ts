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

export const waitFor = (cb: () => boolean, time?: number) => {
  return new Promise((resolve) => {
    loop(async (stop) => {
      const res = await cb();
      if (res) {
        stop();
        resolve(res);
      }
    }, time || 100);
  });
};
