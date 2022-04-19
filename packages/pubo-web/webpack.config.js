const merge = require('webpack-merge');
const common = require('../../webpack.common.js');
const path = require('path');

module.exports = merge(common, {
  entry: './es/index.js',
  output: {
    filename: 'pubo-web.js',
    library: 'pubo-web',
    path: path.resolve(__dirname, './dist'),
  },
});
