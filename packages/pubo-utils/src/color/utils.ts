export const hex2rgb = (n) => {
  const str = n.toString(2).padStart(24, 0);
  const r = parseInt(str.slice(0, 8), 2);
  const g = parseInt(str.slice(8, 16), 2);
  const b = parseInt(str.slice(16, 24), 2);
  return [r, g, b];
};
