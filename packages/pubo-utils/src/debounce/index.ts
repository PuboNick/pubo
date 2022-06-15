export const debounce = (cb: any, time: number, first) => {
  if (first) {
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
  } else {
    let t;
    return (...args) => {
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(() => cb(...args), time);
    };
  }
};
