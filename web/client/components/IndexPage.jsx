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

    this.onMapClick = this.onMapClick.bind(this);
  }

  componentWillMount() {
    this.baseLayer = L.tileLayer(
      "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken:
          "pk.eyJ1IjoienVpcmlzIiwiYSI6ImNqOXpoMXQxdDZhaGYzM3Bna2Z5eHoxMTIifQ.bEG8N1zXKtOA3RGxDoe9tg",
      },
    );

    const cfg = {
      radius: 0.08,
      maxOpacity: 0.8,
      scaleRadius: true,
      useLocalExtrema: false,
      latField: "lat",
      lngField: "lng",
      valueField: "count",
    };

    this.heatmapLayer = new HeatmapOverlay(cfg);

    this.geoJSONLayer = L.geoJSON(this.state.modelPoints, {
      style: feature => {
        const value = feature.properties.color;
        const h = (1.0 - value) * 240.0 / 359.0;
        const s = 1.0;
        const l = 0.5;
        let r, g, b;

        if (s == 0) {
          r = g = b = l; // achromatic
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255.0);
          g = Math.round(hue2rgb(p, q, h) * 255.0);
          b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255.0);
        }

        let rgb = "";
        rgb = rgb.concat(
          "rgba(",
          String(r),
          ", ",
          String(g),
          ", ",
          String(b),
          ", 1)",
        );
        rgb = rgb.match(
          /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i,
        );

        const returnValue =
          rgb && rgb.length === 4
            ? `#0${parseInt(rgb[1], 10)
                .toString(16)
                .slice(-2)}0${parseInt(rgb[2], 10)
                .toString(16)
                .slice(-2)}0${parseInt(rgb[3], 10)
                .toString(16)
                .slice(-2)}}`
            : "";

        return {
          opacity: 0,
          fillOpacity: 0.4,
          fillColor: returnValue,
        };
      },
    });
  }

  componentDidMount() {
    makeApiGet("http://87.117.178.114:5000/get_sensors_list").then(data => {
      this.map = new L.Map("map", {
        zoomControl: false,
        center: new L.LatLng(data[0].latitude, data[0].longitude),
        zoom: 10,
        layers: [this.baseLayer, this.heatmapLayer, this.geoJSONLayer],
      });

      L.control
        .zoom({
          position: "bottomright",
        })
        .addTo(this.map);

      const dataToSave = {};

      data.forEach(item => {
        const temp = L.marker([item.latitude, item.longitude])
          .addTo(this.map)
          .on("click", this.onMapClick);

        temp._icon.id = item.id;
        dataToSave[item.id] = item;
      });

      this.setState({
        data: dataToSave,
      });
    });

    this.popup = L.popup({maxWidth: 560});

    if (this.state.showRawData) {
      this.getAndParseRawData();
    }

    if (this.state.showModelData) {
      this.getAndParseModelData();
    }
  }

  onMapClick(e) {
    const currentItem = this.state.data[e.target._icon.id];
    // console.log(currentItem);
    // console.log(e);

    makeApiGet(
      `http://87.117.178.114:5000/get_sensor_data/${currentItem.id}`,
    ).then(data => {
      console.log(data);

      let measures = JSON.parse(data.measures.data.location);
      measures = measures.measures;
      console.log(measures);

      let measuresString = "";

      for (let i = 0; i < measures.length; i++) {
        measuresString += `${measures[i].parameter}: ${measures[i].value} ${
          measures[i].unit
        }<br>`;
      }

      this.popup
        .setLatLng(e.target._latlng)
        .setContent(
          `ID: ${currentItem.id}<br>
Transaction hash: ${data.transaction}<br>
Latitude: ${currentItem.latitude}<br>
Longitude: ${currentItem.longitude}<br>
${measuresString}`,
        )
        .openOn(this.map);
    });
  }

  componentWillUnmount() {
    this.map = null;
  }

  getAndParseRawData() {
    makeApiGet("/api/getRawData").then(data => {
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
          count: entry.value,
        };
      });

      const newState = Object.assign({}, this.state, {min, max});
      newState.rawPoints = points;
      this.setState(newState);
    });
  }

  getAndParseModelData() {
    makeApiGet("/api/getModelData").then(data => {
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

      const newState = Object.assign({}, this.state);
      newState.modelPoints = data;
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
    const newState = Object.assign({}, this.state);

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
    const percent = Math.floor(
      value * 100 / Math.abs(this.state.max - this.state.min),
    );

    return numberToColorRgb(100 - percent);
  }

  render() {
    const data = {
      max: this.state.max,
      min: this.state.min,
      data: this.prepareData(),
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

    const rawDataClass = !this.state.showRawData
      ? "btn btn-block btn-success"
      : "btn btn-block btn-outline-success";
    const modelDataClass = !this.state.showModelData
      ? "btn btn-block btn-success"
      : "btn btn-block btn-outline-success";

    const rawDataValue = this.state.showRawData
      ? "Hide raw data"
      : "Show raw data";
    const modelDataValue = this.state.showModelData
      ? "Hide model data"
      : "Show model data";

    return (
      <div className="app-wrapper">
        <div id="map" />
      </div>
    );
  }
}
