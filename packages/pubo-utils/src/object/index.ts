export function cloneDeep(data: any, hash = new WeakMap()): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  } else if (hash.has(data)) {
    return hash.get(data);
  } else if (Array.isArray(data)) {
    const clone = data.map((item) => cloneDeep(item, hash));
    hash.set(data, clone);
    return clone;
  } else if (data instanceof Set) {
    const clone = new Set([...data].map((item) => cloneDeep(item, hash)));
    hash.set(data, clone);
    return clone;
  } else if (data instanceof Map) {
    const clone = new Map();
    for (const [key, value] of data.entries()) {
      clone.set(cloneDeep(key, hash), cloneDeep(value, hash));
    }
    hash.set(data, clone);
    return clone;
  } else {
    const clone: Record<string, any> = {};
    hash.set(data, clone);
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        clone[key] = cloneDeep(data[key], hash);
      }
    }
    return clone;
  }
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
        if (bool) {
          break;
        }
        tmp.pop();
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

export const filterTree = (tree: any, cb: (item: any) => boolean, key: string = 'children') => {
  const tmp: any[] = [];
  let arr: any = [];
  if (Array.isArray(tree[key])) {
    arr = tree[key];
  } else if (Array.isArray(tree)) {
    arr = tree;
  }

  arr.forEach((item: any) => {
    if (item[key]) {
      item[key] = filterTree(item[key], cb);
    }
    if (item[key]?.length > 0 || cb(item)) {
      tmp.push(item);
    }
  });

  return tmp;
};

export const reflection = (obj: any): any => {
  const res: any = {};

  for (const key of Object.keys(obj)) {
    res[obj[key]] = key;
  }

  return res;
};
