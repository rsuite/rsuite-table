const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { NODE_ENV } = process.env;

const docsPath = NODE_ENV === 'development' ? './assets' : './';

module.exports = () => {
  return {
    entry: './docs/index.tsx',
    devtool: 'source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devServer: {
      hot: true,
      devMiddleware: {
        publicPath: '/'
      },
      static: {
        directory: path.resolve(__dirname, ''),
      },
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
