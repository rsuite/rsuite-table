const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const markdownLoader = require('markdownloader').renderer;
const { NODE_ENV } = process.env;


const extractLess = new ExtractTextPlugin({
  filename: '[name].[contenthash].css',
  disable: NODE_ENV === 'development'
});


const docsPath = NODE_ENV === 'development' ? './assets' : './';
const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NamedModulesPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  }),

  extractLess,
  new HtmlwebpackPlugin({
    title: 'RSUITE Table',
    filename: 'index.html',
    template: 'docs/index.html',
    inject: true,
    hash: true,
    path: docsPath
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin());
  plugins.push(new webpack.BannerPlugin({ banner: `Last update: ${new Date().toString()}` }));
  plugins.push(new CompressionPlugin({
    asset: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.(js|html)$/,
    threshold: 10240,
    minRatio: 0.8
  }));
}
const common = {
  entry: path.resolve(__dirname, 'src/'),
  devtool: 'source-map',
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, ''),
    publicPath: '/',
    disableHostCheck: true
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'bundle.js',
    publicPath: './'
  },
  plugins,
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: [
        'babel-loader'
      ],
      exclude: /node_modules/
    }, {
      test: /\.less$/,
      loader: extractLess.extract({
        use: [{
          loader: 'css-loader'
        }, {
          loader: 'less-loader'
        }],
        // use style-loader in development
        fallback: 'style-loader'
      })
    }, {
      test: /\.md$/,
      use: [{
        loader: 'html-loader'
      }, {
        loader: 'markdown-loader',
        options: {
          pedantic: true,
          renderer: markdownLoader.renderer
        }
      }
      ]
    }, {
      test: /\.(woff|woff2|eot|ttf|svg)($|\?)/,
      use: [{
        loader: 'url-loader?limit=1&hash=sha512&digest=hex&size=16&name=resources/[hash].[ext]'
      }]

    }]
  }
};

module.exports = (env = {}) => {

  if (NODE_ENV === 'development') {
    return Object.assign({}, common, {
      entry: [
        'babel-polyfill',
        'react',
        'react-dom',
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://127.0.0.1:3100',
        'webpack/hot/only-dev-server',
        path.resolve(__dirname, 'docs/index')
      ],
      devtool: 'source-map'
    });
  }

  return Object.assign({}, common, {
    entry: [
      path.resolve(__dirname, 'docs/index')
    ]
  });
};
