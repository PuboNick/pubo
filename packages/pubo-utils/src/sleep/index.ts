/**
 * Asynchronous function to sleep for a specified amount of time.
 *
 * @param {number} time - The duration in milliseconds to sleep
 * @return {Promise<void>} A promise that resolves after the specified time
 */

export const sleep = async (time: number) => {
  await new Promise((resolve: any) => {
    let timeout: any = setTimeout(() => {
      resolve();
      clearTimeout(timeout);
      timeout = null;
    }, time);
  });
};

// 超时异常
export const timeout = async (cb, time = 10000): Promise<any> => {
  // oxlint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    let ended = false;
    const t = setTimeout(() => {
      ended = true;
      reject(new Error('Timeout'));
    }, time);
    let result;
    try {
      result = await cb();
      clearTimeout(t);
    } catch (err) {
      console.log(err);
      clearTimeout(t);
      if (!ended) {
        reject(err);
      }
    }

    if (!ended) {
      resolve(result);
    }
  });
};