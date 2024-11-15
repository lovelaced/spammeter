const path = require('path')

module.exports = {
  // ... existing configuration ...
  module: {
    rules: [
      // ... existing rules ...
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader' },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
}

