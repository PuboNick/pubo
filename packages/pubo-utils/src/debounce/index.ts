export const debounce = (cb: any, time: number, first = false) => {
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
      t = setTimeout(() => {
        clearTimeout(t);
        shouldRun = true;
        t = null;
      }, time);
    };
  } else {
    let t;
    return (...args) => {
      if (t) {
        clearTimeout(t);
        t = null;
      }
      t = setTimeout(() => {
        cb(...args);
        clearTimeout(t);
        (args as any) = null;
        t = null;
      }, time);
    };
  }
};
