// 回调函数转异步函数
export const callbackToPromise = (fn): any => {
  return (...args) =>
    new Promise((resolve: any, reject) => {
      fn(...args, (err, ...rest) => {
        if (err) {
          reject(err);
        }
        if (rest.length < 2) {
          resolve(rest[0]);
        } else {
          resolve([...rest]);
        }
      });
    });
};
