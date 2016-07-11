const path = require('path');
const webpack = require('webpack');

const isPublish = process.env.NODE_ENV === 'publish';
const plugins = [];

if (isPublish) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
    plugins.push(new webpack.BannerPlugin(`Last update: ${new Date().toString()}`));
}

module.exports = {
    entry: {
        index: path.join(__dirname, 'docs')
    },
    output: {
        path: path.join(__dirname, 'docs/assets'),
        filename: '[name].js',
    },
    plugins: plugins,
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: [
                'babel?babelrc'
            ],
            exclude: /node_modules/
        }, {
            test: /\.less$/,
            loaders: [
                'style',
                'css?minimize',
                'less'
            ]
        }],
        postLoaders: [{
            test: /\.js$/,
            loaders: ['es3ify-loader'],
        }]

    }
};
