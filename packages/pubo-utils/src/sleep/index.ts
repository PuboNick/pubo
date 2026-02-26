/**
 * Asynchronous function to sleep for a specified amount of time.
 *
 * @param {number} time - The duration in milliseconds to sleep
 * @return {Promise<void>} A promise that resolves after the specified time
 */
export const sleep = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

// 超时异常
export const timeout = <T>(cb: () => Promise<T>, time = 10000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Timeout')), time);
    cb()
      .then((result) => {
        clearTimeout(t);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(t);
        reject(err);
      });
  });
};