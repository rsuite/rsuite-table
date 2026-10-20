/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { NODE_ENV } = process.env;
module.exports = (_, argv = {}) => {
  const isDevelopment = (argv.mode || NODE_ENV) === 'development';
  const usePublishedTable = !isDevelopment && process.env.RSUITE_TABLE_DOCS_SOURCE !== 'true';
  const docsPath = isDevelopment ? './assets' : './';

  return {
    mode: isDevelopment ? 'development' : 'production',
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
      contentBase: path.resolve(__dirname, ''),
      publicPath: '/'
    },
    output: {
      path: path.resolve(__dirname, 'assets'),
      filename: 'bundle.js',
      publicPath: './'
    },
    plugins: [
      new HtmlwebpackPlugin({
        filename: 'index.html',
        template: 'docs/index.html',
        inject: true,
        hash: true,
        path: docsPath
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
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
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader'
            },
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
          use: [
            {
              loader:
                'url-loader?limit=1&hash=sha512&digest=hex&size=16&name=resources/[hash].[ext]'
            }
          ]
        }
      ]
    }
  };
};
