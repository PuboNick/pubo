export const debounce = (cb: any, time: number) => {
  let shouldRun = true;
  let t;
  return (...args) => {
    if (shouldRun) {
      cb(...args);
      shouldRun = false;
    }
    if (t) {
      clearTimeout(t);
    }
    t = setTimeout(() => (shouldRun = true), time);
  };
};
