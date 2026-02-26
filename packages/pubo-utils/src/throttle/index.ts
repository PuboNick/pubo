import { SyncQueue } from '../queue';
import { sleep } from '../sleep';

export function throttle<T extends unknown[]>(cb: (...args: T) => void | Promise<void>, time: number) {
  const queue = new SyncQueue();
  let payload: T | null = null;

  return (...args: T): void | Promise<void> => {
    payload = args;
    if (queue.length > 0) {
      return;
    }
    return queue.push(async () => {
      await sleep(time);
      if (payload) {
        await cb(...payload);
      }
    });
  };
}
