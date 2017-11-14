var path = require('path');
var webpack = require('webpack');

module.exports = {
	entry: [
		'webpack-hot-middleware/client', 
		path.join(__dirname, '/client/app.js')
	],
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    },
	plugins: [
		new webpack.NoErrorsPlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.HotModuleReplacementPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(__dirname, '/client'),
				loaders: ['react-hot', 'babel']
			}
		]
	},
	resolve: {
		extentions: ['', '.js', '.jsx']
	}
};