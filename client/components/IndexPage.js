import React from "react";
import HeatmapOverlay from "leaflet-heatmap";
import {makeApiGet} from "../common/Api";
import {hue2rgb, numberToColorRgb} from "../common/Utils";

export default class IndexPage extends React.Component {
    constructor(state, props) {
        super(state, props);

        this.state = {
            max: -1000,
            min: 1000,

            rawPoints: [],
            modelPoints: [],

            showRawData: false,
            showModelData: false,
        };

        this.baseLayer;
        this.heatmapLayer;
        this.map;
        this.geoJSONLayer;
    }

    componentWillMount() {
        this.baseLayer = L.tileLayer(
            'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoienVpcmlzIiwiYSI6ImNqOXpoMXQxdDZhaGYzM3Bna2Z5eHoxMTIifQ.bEG8N1zXKtOA3RGxDoe9tg'
            }
        );

        let cfg = {
            radius: 0.08,
            maxOpacity: 0.8,
            scaleRadius: true,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };

        this.heatmapLayer = new HeatmapOverlay(cfg);

        this.geoJSONLayer = L.geoJSON(this.state.modelPoints, {
            style: (feature) => {
                let value = feature.properties.color;
                let h = (1.00 - value) * 240.0 / 359.0;
                let s = 1.00;
                let l = 0.50;
                let r, g, b;

                if (s == 0) {
                    r = g = b = l; // achromatic
                } else {
                    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    let p = 2 * l - q;
                    r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255.0);
                    g = Math.round(hue2rgb(p, q, h) * 255.0);
                    b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255.0);
                }

                let rgb = '';
                rgb = rgb.concat('rgba(', String(r), ', ', String(g), ', ', String(b), ', 1)');
                rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);

                let return_value = (rgb && rgb.length === 4) ? "#" +
                    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';

                return {
                    opacity: 0,
                    fillOpacity: 0.4,
                    fillColor: return_value
                }
            }
        });
    }

    componentDidMount() {
        this.map = new L.Map('map', {
            zoomControl: false,
            center: new L.LatLng(50.7, 7.1),
            zoom: 13,
            layers: [this.baseLayer, this.heatmapLayer, this.geoJSONLayer]
        });

        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);

        if (this.state.showRawData) {
            this.getAndParseRawData();
        }

        if (this.state.showModelData) {
            this.getAndParseModelData();
        }
    }

    componentWillUnmount() {
        this.map = null;
    }

    getAndParseRawData() {
        makeApiGet('/api/getRawData').then((data) => {
            let min = this.state.min;
            let max = this.state.max;

            const points = data.results.map(entry => {
                if (entry.value > max) {
                    max = entry.value;
                } else if (entry.value < min) {
                    min = entry.value;
                }

                return {
                    lat: entry.coordinates.latitude,
                    lng: entry.coordinates.longitude,
                    count: entry.value
                }
            });

            let newState = Object.assign({}, this.state, {min, max});
            newState['rawPoints'] = points;
            this.setState(newState);
        });
    }

    getAndParseModelData() {
        makeApiGet('/api/getModelData').then((data) => {
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

            let newState = Object.assign({}, this.state);
            newState['modelPoints'] = data;
            this.setState(newState);
        });
    }

    getData(buttonName) {
        switch (buttonName) {
            case "showRawData":
                this.getAndParseRawData();
                break;
            default:
                this.getAndParseModelData();
                break;
        }
    }

    toggleButton(buttonName) {
        let newState = Object.assign({}, this.state);

        newState[buttonName] = !newState[buttonName];

        this.getData(buttonName);

        this.setState(newState);
    }

    prepareData() {
        let result = [];

        if (this.state.showRawData) {
            result = this.state.rawPoints;
        }

        // if (this.state.showModelData) {
        //     result = result.concat(this.state.modelPoints);
        // }

        return result;
    }


    getDotColor(value) {
        let percent = Math.floor(value * 100 / Math.abs(this.state.max - this.state.min));
        return numberToColorRgb(100 - percent);
    }

    render() {
        let data = {
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

        let rawDataClass = (this.state.showRawData) ? "btn btn-block btn-success" : "btn btn-block btn-outline-success";
        let modelDataClass = (this.state.showModelData) ? "btn btn-block btn-success" : "btn btn-block btn-outline-success";

        let rawDataValue = (this.state.showRawData) ? "Hide raw data" : "Show raw data";
        let modelDataValue = (this.state.showModelData) ? "Hide model data" : "Show model data";

        return (
            <div className="app-wrapper">
                <div id="map"/>
                <div id="leaflet-buttons-wrapper">
                    <input type="button" className={rawDataClass} value={rawDataValue}
                           onClick={() => {
                               this.toggleButton("showRawData");
                           }}
                    />
                    <input type="button" className={modelDataClass} value={modelDataValue}
                           onClick={() => {
                               this.toggleButton("showModelData");
                           }}
                    />
                </div>
            </div>
        );
    }
}