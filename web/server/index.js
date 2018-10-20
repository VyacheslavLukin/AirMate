import express from "express";
import path from "path";
import webpack from "webpack";
import webpackMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
import webpackConfig from "../webpack.config";

let app = express();

const compiler = webpack(webpackConfig);

//CORS
app.use(function(req, res, next) {
    let allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5000',
        'http://87.117.178.114:3000',
        'http://87.117.178.114:5000',
        'http://map.earth.airmate:3000',
        'http://map.earth.airmate:5000'
    ];
    let origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) > -1){
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    return next();
});

app.use(webpackMiddleware(compiler, {
    hot: true,
    publicPath: webpackConfig.output.publicPath,
    noInfo: true
}));

// Static
app.use('/static', express.static('public'));

app.use(webpackHotMiddleware(compiler));

// Api
app.get('/api/getRawData', (req, res) => {
    //reward goes to someones waves wallet who's data we gather
    //TODO
    res.sendFile(path.join(__dirname, '../sampleRawData.json'));
});

app.get('/api/getModelData', (req, res) => {
    res.sendFile(path.join(__dirname, '../sampleRectangularData.json'));
    //reward goes to application developer of the modelled data
    //TODO
    // res.sendFile(path.join(__dirname, '../sampleModelData.json'));
});

// Index
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

app.listen(3000, () => console.log('running on localhost:3000'));
