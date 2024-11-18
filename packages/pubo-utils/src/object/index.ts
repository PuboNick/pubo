export function cloneDeep(data, hash = new WeakMap()) {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  if (hash.has(data)) {
    return hash.get(data);
  }
  const tmp = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (typeof value !== 'object' || value === null) {
      tmp[key] = value;
    } else if (Array.isArray(value)) {
      tmp[key] = value.map((item) => cloneDeep(item, hash));
    } else if (value instanceof Set) {
      tmp[key] = new Set([...value]);
    } else if (value instanceof Map) {
      tmp[key] = new Map([...value]);
    } else {
      hash.set(data, data);
      tmp[key] = cloneDeep(value, hash);
    }
  });
  return tmp;
}
