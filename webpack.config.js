/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const { NODE_ENV } = process.env;
module.exports = (_, argv = {}) => {
  const isDevelopment = (argv.mode || NODE_ENV) === 'development';
  const usePublishedTable = !isDevelopment && process.env.RSUITE_TABLE_DOCS_SOURCE !== 'true';
  const docsPath = isDevelopment ? './assets' : './';

  return {
    mode: isDevelopment ? 'development' : 'production',
    experiments: { css: true },
    // Keep authored numeric precision for long examples and row geometry.
    ...(!isDevelopment && { optimization: { minimize: { css: { shortenNumbers: false } } } }),
    entry: './docs/index.tsx',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      // Production examples and styles use the same published package.
      alias: {
        'rsuite-table-docs-theme$': usePublishedTable
          ? require.resolve('rsuite-table-docs/lib/less/index.less')
          : path.resolve(__dirname, 'src/less/index.less'),
        ...(usePublishedTable ? { '../src$': require.resolve('rsuite-table-docs') } : {})
      }
    },
    devServer: {
      hot: true,
      // This web app also needs the client when webpack targets browserslist.
      injectClient: true,
      contentBase: path.resolve(__dirname, ''),
      publicPath: '/'
    },
    output: {
      path: path.resolve(__dirname, 'assets'),
      filename: 'bundle.js',
      cssFilename: '[name].css',
      cssChunkFilename: '[id].css',
      assetModuleFilename: 'resources/[contenthash][ext]',
      publicPath: './'
    },
    plugins: [
      new HtmlwebpackPlugin({
        filename: 'index.html',
        template: 'docs/index.html',
        inject: true,
        hash: true,
        path: docsPath
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: ['babel-loader'],
          exclude: /node_modules/
        },
        {
          test: /\.(less|css)$/,
          type: 'css/global',
          parser: { exportType: isDevelopment ? 'style' : 'link' },
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
        },
        {
          test: /\.md$/,
          loader: 'react-code-view/webpack-md-loader'
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)($|\?)/,
          type: 'asset/resource'
        }
      ]
    }
  };
};
