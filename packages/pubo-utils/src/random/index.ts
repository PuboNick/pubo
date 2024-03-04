/**
 * Generates a random string of specified length.
 *
 * @param {number} n - The length of the random string to generate
 * @return {string} The randomly generated string
 */

export const random = (n = 8) => {
  const ra = (x: number) =>
    Math.random()
      .toString(32)
      .slice(2, 2 + x);

  if (n <= 8) {
    return ra(n);
  }

  let res = '';
  for (let a = 0; a <= n; a += 8) {
    if (n - a > 8) {
      res += ra(8);
    } else {
      res += ra(n - a);
    }
  }

  return res;
};

/**
 * Generates a random number within the specified range.
 *
 * @param {number[]} range - The range within which to generate the random number.
 * @return {number} The randomly generated number within the specified range.
 */
export const randomRangeNum = (range) => {
  const size = Math.abs(range[1] - range[0]);
  return Math.random() * size + Math.min(...range);
};
