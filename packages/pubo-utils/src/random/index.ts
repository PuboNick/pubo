const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generates a random string of specified length.
 *
 * @param {number} n - The length of the random string to generate
 * @return {string} The randomly generated string
 */
export const random = (n = 8): string => {
  let result = '';
  for (let i = 0; i < n; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};

/**
 * Generates a random number within the specified range.
 *
 * @param {number[]} range - The range within which to generate the random number.
 * @return {number} The randomly generated number within the specified range.
 */
export const randomRangeNum = (range: [number, number]): number => {
  const [min, max] = range[0] < range[1] ? [range[0], range[1]] : [range[1], range[0]];
  return Math.random() * (max - min) + min;
};
