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
  let stop = () => {
    onOff = false;
  };

  let fn: any = async () => {
    try {
      await cb();
    } catch (err) {
      console.log(err);
    }
    await sleep(time);
    if (onOff) {
      fn();
    } else {
      fn = null;
      (cb as any) = null;
      (stop as any) = null;
      (onOff as any) = null;
      (time as any) = null;
    }
  };
  fn();

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
    let stop: any = loop(async () => {
      const res = await bool();
      if (res) {
        if (typeof stop === 'function') {
          stop();
        }
        stop = null;
        (bool as any) = null;

        (resolve as any) = null;
        resolve(res);
      }
    }, checkTime || 100);

    if (timeout) {
      setTimeout(() => {
        if (typeof stop === 'function') {
          stop();
        }
        stop = null;
        (bool as any) = null;
        reject('timeout');
        (reject as any) = null;
      }, timeout);
    }
  });
};
