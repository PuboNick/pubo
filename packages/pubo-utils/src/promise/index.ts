type CallbackStyleFn<T extends unknown[], R> = (...args: [...T, (err: Error | null, result: R) => void]) => void;

/**
 * 回调函数转异步函数
 */
export const callbackToPromise = <T extends unknown[], R>(fn: CallbackStyleFn<T, R>) => {
  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  };
};
