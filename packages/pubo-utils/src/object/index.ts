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

export function getTreeItem(tree: any, indexes: number[]) {
  if (indexes.length < 1) {
    return null;
  }
  let obj: any;
  if (Array.isArray(tree)) {
    obj = { children: tree };
  }
  for (const index of indexes) {
    obj = obj.children[index];
  }

  return cloneDeep(obj);
}

export function searchTree(tree: any, cb: (item: any) => boolean, key: string = 'children'): number[] {
  const tmp: number[] = [];
  let bool = false;
  const each = (list) => {
    for (let i = 0; i < list.length; i += 1) {
      const item = list[i];
      if (cb(item)) {
        bool = true;
        tmp.push(i);
        break;
      }
      if (Array.isArray(item[key])) {
        tmp.push(i);
        each(item[key]);
      }
    }
  };

  if (Array.isArray(tree)) {
    each(tree);
  } else if (Array.isArray(tree[key])) {
    each(tree[key]);
  }

  return bool ? tmp : [];
}

export const flatTree = (tree: any, key: string = 'children', indexes: number[] = [], tmp: any[] = []) => {
  let arr: any = [];
  if (Array.isArray(tree[key])) {
    arr = tree[key];
  } else if (Array.isArray(tree)) {
    arr = tree;
  }

  arr.forEach((item, i: number) => {
    const res = { ...item };
    delete res[key];
    tmp.push(res);
    res.__indexes = [...indexes, i];
  });
  arr.forEach((item, i: number) => flatTree(item, key, [...indexes, i], tmp));
  return tmp;
};
