const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/app.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        // include: [path.resolve(__dirname, 'src')],
        exclude: /node_modules/,
        use: 'ts-loader',
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  optimization: {
    minimize: false
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
