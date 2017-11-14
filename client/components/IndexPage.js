import React from "react";
import HeatmapOverlay from "leaflet-heatmap";
import {makeApiGet} from "../common/Api";

export default class IndexPage extends React.Component {
    constructor(state, props) {
        super(state, props);

        this.state = {
            max: 0,
            min: -100,
            points: []
        };

        this.baseLayer;
        this.heatmapLayer;
        this.map;
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
            radius: 0.1,
            maxOpacity: .8,
            scaleRadius: true,
            useLocalExtrema: false,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };

        this.heatmapLayer = new HeatmapOverlay(cfg);
    }

    componentDidMount() {
        this.map = new L.Map('map', {
            center: new L.LatLng(50.7343800, 7.0954900),
            zoom: 5,
            layers: [this.baseLayer, this.heatmapLayer]
        });

        makeApiGet('/api/getData').then((data) => {
            let min = this.state.min;
            let max = this.state.max;
            const points = data.results.map(entry => {
                if (entry.value > max) {
                    max = entry.value;
                } else if (entry.value < min ) {
                    min = entry.value;
                }

                return {
                    lat: entry.coordinates.latitude,
                    lng: entry.coordinates.longitude,
                    count: entry.value
                }
            });

            this.setState(
                Object.assign({}, {
                    min: min,
                    max: max,
                    points: points
                })
            );
        });
    }

    render() {
        let data = {
            max: this.state.max,
            min: this.state.min,
            data: this.state.points
        };

        this.heatmapLayer.setData(data);

        return (
            <div>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark fixed-top">
                    <a className="offset-5 col-sm-2 navbar-brand text-align-center" href="#">
                        <img src="/static/img/baum.svg" height="80px"/>
                    </a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarsExampleDefault"
                            aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"/>
                    </button>
                </nav>

                <main role="main" className="container">
                    <div style={{
                        "paddingTop": "5rem"
                    }}>
                        {/*Map rendering*/}
                        <div id="map"/>
                    </div>
                </main>
            </div>
        );
    }
}