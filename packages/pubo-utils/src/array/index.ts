export const concatArray = (list: any[], Type: any = Array) => {
  const size = list.map((item) => item.length).reduce((v, n) => v + n, 0);
  const res = new Type(size);
  let j = 0;
  let k = 0;
  let i = 0;

  while (i < size) {
    if (j < list[k].length) {
      res[i] = list[k][j];
      j += 1;
      i += 1;
    } else {
      k += 1;
      j = 0;
    }
  }
  return res;
};
