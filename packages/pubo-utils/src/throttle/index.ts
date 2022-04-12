export function throttle(cb, time) {
  let t;
  let onOff = true;
  return () => {
    if (!t) {
      t = setTimeout(() => {
        onOff = true;
        t = null;
      }, time);
    }

    if (onOff) {
      onOff = false;
      cb();
    }
  };
}
