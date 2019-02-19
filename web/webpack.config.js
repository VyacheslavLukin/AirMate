const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

const env = dotenv.config().parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
}, {});

module.exports = {
    entry: [
        'webpack-hot-middleware/client',
        path.join(__dirname, '/client/App.jsx')
    ],
    output: {
        path: path.resolve(__dirname, 'public', 'dist'),
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin(envKeys)
    ],
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                include: path.join(__dirname, '/client'),
                loaders: ['react-hot-loader', 'babel-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
};
