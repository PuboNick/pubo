type DebounceFunction<T extends (...args: unknown[]) => void> = (...args: Parameters<T>) => void;

export const debounce = <T extends (...args: unknown[]) => void>(
  cb: T,
  time: number,
  first = false,
): DebounceFunction<T> => {
  if (first) {
    let shouldRun = true;
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (shouldRun) {
        cb(...args);
        shouldRun = false;
      }
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(() => {
        shouldRun = true;
        t = null;
      }, time);
    };
  } else {
    let t: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
      if (t) {
        clearTimeout(t);
      }
      t = setTimeout(() => {
        cb(...args);
        t = null;
      }, time);
    };
  }
};
