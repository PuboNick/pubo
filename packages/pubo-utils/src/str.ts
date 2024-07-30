// 下划线转驼峰
export const lower2camel = (str) => {
  return str
    .split('_')
    .map((item, i) => (i > 0 ? item.slice(0, 1).toUpperCase() + item.slice(1) : item))
    .join('');
};
