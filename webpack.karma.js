/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'development',
  experiments: { css: true },
  output: {
    pathinfo: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: [/\.tsx?$/, /\.jsx?$/],
        use: ['babel-loader?babelrc'],
        exclude: /node_modules/
      },
      {
        test: /\.(less|css)$/,
        type: 'css/global',
        parser: { exportType: 'style' },
        use: [
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      }
    ]
  },
  devtool: 'eval'
};
