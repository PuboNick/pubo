export function throttle(cb, time: number) {
  let t;
  let onOff = true;
  return (...args) => {
    if (!t) {
      t = setTimeout(() => {
        clearTimeout(t);
        onOff = true;
        t = null;
      }, time);
    }

    if (onOff) {
      onOff = false;
      cb(...args);
    }
    (args as any) = null;
  };
}
