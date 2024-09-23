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
