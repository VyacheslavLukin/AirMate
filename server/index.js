import express from "express";
import path from "path";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpackConfig from "../webpack.config";

let app = express();

const compiler = webpack(webpackConfig);

app.use(webpackMiddleware(compiler, {
    hot: true,
    publicPath: webpackConfig.output.publicPath,
    noInfo: true
}));

// Static
app.use('/static', express.static('public'));

app.use(webpackHotMiddleware(compiler));

// Api
app.get('/api/getData', (req, res) => {
    res.sendFile(path.join(__dirname, '../sampleData.json'));
});

// Index
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.listen(3000, () => console.log('running on localhost:3000'));