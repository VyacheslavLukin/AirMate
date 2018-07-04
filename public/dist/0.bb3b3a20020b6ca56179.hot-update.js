webpackHotUpdate(0,{

/***/ 353:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {/* REACT HOT LOADER */ if (true) { (function () { var ReactHotAPI = __webpack_require__(28), RootInstanceProvider = __webpack_require__(29), ReactMount = __webpack_require__(20), React = __webpack_require__(4); module.makeHot = module.hot.data ? module.hot.data.makeHot : ReactHotAPI(function () { return RootInstanceProvider.getRootInstances(ReactMount); }, React); })(); } try { (function () {

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = __webpack_require__(354);

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = __webpack_require__(150);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(97);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(154);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(155);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(168);

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = __webpack_require__(4);

var _react2 = _interopRequireDefault(_react);

var _leafletHeatmap = __webpack_require__(358);

var _leafletHeatmap2 = _interopRequireDefault(_leafletHeatmap);

var _Api = __webpack_require__(359);

var _Utils = __webpack_require__(378);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IndexPage = function (_React$Component) {
  (0, _inherits3.default)(IndexPage, _React$Component);

  function IndexPage(state, props) {
    (0, _classCallCheck3.default)(this, IndexPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (IndexPage.__proto__ || (0, _getPrototypeOf2.default)(IndexPage)).call(this, state, props));

    _this.state = {
      max: -1000,
      min: 1000,

      rawPoints: [],
      modelPoints: [],

      showRawData: false,
      showModelData: false
    };
    return _this;
  }

  (0, _createClass3.default)(IndexPage, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.baseLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: "pk.eyJ1IjoienVpcmlzIiwiYSI6ImNqOXpoMXQxdDZhaGYzM3Bna2Z5eHoxMTIifQ.bEG8N1zXKtOA3RGxDoe9tg"
      });

      var cfg = {
        radius: 0.08,
        maxOpacity: 0.8,
        scaleRadius: true,
        useLocalExtrema: false,
        latField: "lat",
        lngField: "lng",
        valueField: "count"
      };

      this.heatmapLayer = new _leafletHeatmap2.default(cfg);

      this.geoJSONLayer = L.geoJSON(this.state.modelPoints, {
        style: function style(feature) {
          var value = feature.properties.color;
          var h = (1.0 - value) * 240.0 / 359.0;
          var s = 1.0;
          var l = 0.5;
          var r = void 0,
              g = void 0,
              b = void 0;

          if (s == 0) {
            r = g = b = l; // achromatic
          } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = Math.round((0, _Utils.hue2rgb)(p, q, h + 1 / 3) * 255.0);
            g = Math.round((0, _Utils.hue2rgb)(p, q, h) * 255.0);
            b = Math.round((0, _Utils.hue2rgb)(p, q, h - 1 / 3) * 255.0);
          }

          var rgb = "";
          rgb = rgb.concat("rgba(", String(r), ", ", String(g), ", ", String(b), ", 1)");
          rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

          var returnValue = rgb && rgb.length === 4 ? "#0" + parseInt(rgb[1], 10).toString(16).slice(-2) + "0" + parseInt(rgb[2], 10).toString(16).slice(-2) + "0" + parseInt(rgb[3], 10).toString(16).slice(-2) + "}" : "";

          return {
            opacity: 0,
            fillOpacity: 0.4,
            fillColor: returnValue
          };
        }
      });
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.map = new L.Map("map", {
        zoomControl: false,
        center: new L.LatLng(55.7517163, 7.1),
        zoom: 13,
        layers: [this.baseLayer, this.heatmapLayer, this.geoJSONLayer]
      });

      L.control.zoom({
        position: "bottomright"
      }).addTo(this.map);

      if (this.state.showRawData) {
        this.getAndParseRawData();
      }

      if (this.state.showModelData) {
        this.getAndParseModelData();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.map = null;
    }
  }, {
    key: "getAndParseRawData",
    value: function getAndParseRawData() {
      var _this2 = this;

      (0, _Api.makeApiGet)("/api/getRawData").then(function (data) {
        var min = _this2.state.min;
        var max = _this2.state.max;

        var points = data.results.map(function (entry) {
          if (entry.value > max) {
            max = entry.value;
          } else if (entry.value < min) {
            min = entry.value;
          }

          return {
            lat: entry.coordinates.latitude,
            lng: entry.coordinates.longitude,
            count: entry.value
          };
        });

        var newState = (0, _assign2.default)({}, _this2.state, { min: min, max: max });
        newState.rawPoints = points;
        _this2.setState(newState);
      });
    }
  }, {
    key: "getAndParseModelData",
    value: function getAndParseModelData() {
      var _this3 = this;

      (0, _Api.makeApiGet)("/api/getModelData").then(function (data) {
        // let min = this.state.min;
        // let max = this.state.max;

        // const shapes = data.results.map(entry => {
        //     if (entry.value > max) {
        //         max = entry.value;
        //     } else if (entry.value < min) {
        //         min = entry.value;
        //     }
        //
        //     return {
        //         lat: entry.coordinates.latitude,
        //         lng: entry.coordinates.longitude,
        //         count: entry.value
        //     }
        // });

        var newState = (0, _assign2.default)({}, _this3.state);
        newState.modelPoints = data;
        _this3.setState(newState);
      });
    }
  }, {
    key: "getData",
    value: function getData(buttonName) {
      switch (buttonName) {
        case "showRawData":
          this.getAndParseRawData();
          break;
        default:
          this.getAndParseModelData();
          break;
      }
    }
  }, {
    key: "toggleButton",
    value: function toggleButton(buttonName) {
      var newState = (0, _assign2.default)({}, this.state);

      newState[buttonName] = !newState[buttonName];

      this.getData(buttonName);

      this.setState(newState);
    }
  }, {
    key: "prepareData",
    value: function prepareData() {
      var result = [];

      if (this.state.showRawData) {
        result = this.state.rawPoints;
      }

      // if (this.state.showModelData) {
      //     result = result.concat(this.state.modelPoints);
      // }

      return result;
    }
  }, {
    key: "getDotColor",
    value: function getDotColor(value) {
      var percent = Math.floor(value * 100 / Math.abs(this.state.max - this.state.min));

      return (0, _Utils.numberToColorRgb)(100 - percent);
    }
  }, {
    key: "render",
    value: function render() {
      var data = {
        max: this.state.max,
        min: this.state.min,
        data: this.prepareData()
      };

      this.heatmapLayer.setData(data);

      this.geoJSONLayer.clearLayers();

      if (this.state.showModelData) {
        this.geoJSONLayer.addData(this.state.modelPoints);
      } else {
        // this.state.rawPoints.map(point => {
        //     let color = this.getDotColor(point.count);
        //     L.circle([point.lat, point.lng], {
        //         radius: 100,
        //         color: color,
        //         fillColor: color,
        //         fill: 1,
        //         fillOpacity: 0.3,
        //         opacity: 0.3
        //     }).addTo(this.map);
        // })
        // let data = {
        //     max: this.state.max,
        //     min: this.state.min,
        //     data: this.prepareData()
        // };
        //
        // this.heatmapLayer.setData(data);
      }

      var rawDataClass = !this.state.showRawData ? "btn btn-block btn-success" : "btn btn-block btn-outline-success";
      var modelDataClass = !this.state.showModelData ? "btn btn-block btn-success" : "btn btn-block btn-outline-success";

      var rawDataValue = this.state.showRawData ? "Hide raw data" : "Show raw data";
      var modelDataValue = this.state.showModelData ? "Hide model data" : "Show model data";

      return _react2.default.createElement(
        "div",
        { className: "app-wrapper" },
        _react2.default.createElement("div", { id: "map" })
      );
    }
  }]);
  return IndexPage;
}(_react2.default.Component);

exports.default = IndexPage;

/* REACT HOT LOADER */ }).call(this); } finally { if (true) { (function () { var foundReactClasses = module.hot.data && module.hot.data.foundReactClasses || false; if (module.exports && module.makeHot) { var makeExportsHot = __webpack_require__(34); if (makeExportsHot(module, __webpack_require__(4))) { foundReactClasses = true; } var shouldAcceptModule = true && foundReactClasses; if (shouldAcceptModule) { module.hot.accept(function (err) { if (err) { console.error("Cannot apply hot update to " + "IndexPage.jsx" + ": " + err.message); } }); } } module.hot.dispose(function (data) { data.makeHot = module.makeHot; data.foundReactClasses = foundReactClasses; }); })(); } }
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(23)(module)))

/***/ })

})