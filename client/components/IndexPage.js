import React from "react";
import HeatmapOverlay from "leaflet-heatmap"

export default class IndexPage extends React.Component {
    componentDidMount() {
        // Heatmap
        let testData = {
                max: 8,
                data: [
                    {
                        lat: 50.7343800,
                        lng: 7.0954900,
                        count: 3
                    },
                    {
                        lat: 50.7343800,
                        lng: 7.0854900,
                        count: 1
                    }
                ]
            }
        ;

        let baseLayer = L.tileLayer(
            'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoienVpcmlzIiwiYSI6ImNqOXpoMXQxdDZhaGYzM3Bna2Z5eHoxMTIifQ.bEG8N1zXKtOA3RGxDoe9tg'
            }
        );

        let cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 0.01,
            "maxOpacity": .8,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'lat',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lng',
            // which field name in your data represents the data value - default "value"
            valueField: 'count'
        };

        let heatmapLayer = new HeatmapOverlay(cfg);

        let map = new L.Map('map', {
            center: new L.LatLng(50.7343800, 7.0954900),
            zoom: 13,
            layers: [baseLayer, heatmapLayer]
        });

        heatmapLayer.setData(testData);
    }

    render() {
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