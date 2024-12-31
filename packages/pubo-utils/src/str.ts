// 下划线转驼峰
export const lower2camel = (str) => {
  return str
    .split('_')
    .map((item, i) => (i > 0 ? item.slice(0, 1).toUpperCase() + item.slice(1) : item))
    .join('');
};

export const fixNum = (num: number | string | undefined | null, n: number = 2): string => {
  if (num === undefined || num === null || num === 'NaN') {
    return 'N/A';
  }

  if (typeof num !== 'number') {
    num = parseFloat(num);
  }
  if (isNaN(num)) {
    return 'N/A';
  }

  return num.toFixed(n);
};
