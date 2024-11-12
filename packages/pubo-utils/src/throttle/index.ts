import { SyncQueue } from '../queue';
import { sleep } from '../sleep';

export function throttle(cb, time: number) {
  const queue = new SyncQueue();
  let payload: any;

  return (...args) => {
    payload = args;
    if (queue.length > 0) {
      return;
    }
    return queue.push(async () => {
      await sleep(time);
      await cb(...payload);
      payload = null;
    });
  };
}
