const { merge } = require('webpack-merge');
const common = require('../../webpack.common.js');
const path = require('path');
const fs = require('fs');

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter((x) => {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach((mod) => {
    nodeModules[mod] = `commonjs ${mod}`;
  });

module.exports = merge(common, {
  entry: './es/index.js',
  output: {
    filename: 'pubo-node.js',
    library: 'pubo-node',
    path: path.resolve(__dirname, './dist'),
  },
  target: 'node',
  context: __dirname,
  externals: nodeModules,
});
