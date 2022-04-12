export const random = (n = 8) => {
  const ra = (x: number) =>
    Math.random()
      .toString(32)
      .slice(2, 2 + x);

  if (n <= 8) {
    return ra(n);
  }

  let res = '';
  for (let a = 8; a <= n; a += 8) {
    if (n - a > 8) {
      res += ra(8);
    } else {
      res += ra(n - a);
    }
  }

  return res;
};
