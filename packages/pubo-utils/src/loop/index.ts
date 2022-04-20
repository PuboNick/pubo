import { sleep } from '../sleep';

export const loop = (cb: (stop: () => void) => Promise<void>, time: number) => {
  let onOff = true;
  const stop = () => {
    onOff = false;
  };

  const fn = async () => {
    await cb(stop);
    await sleep(time);
    if (onOff) {
      fn();
    }
  };
  fn();

  return stop;
};
