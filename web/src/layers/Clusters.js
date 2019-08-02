import {getParameterGeojson} from '../common/Utils';
import {getMeasurementsFromAllStations} from '../common/Api';

const getAqi = ["get", "aqi"]
const getAvgAqi = ["/", ["get", "aqi_sum"], ["get", "point_count"]]

const mag1 = ["<=", getAqi, 50]; 
const mag2 = ["all", [">", getAqi, 50], ["<=", getAqi, 100]];
const mag3 = ["all", [">", getAqi, 100], ["<=", getAqi, 150]];
const mag4 = ["all", [">", getAqi, 150], ["<=", getAqi, 200]];
const mag5 = ["all", [">", getAqi, 200], ["<=", getAqi, 300]];
const mag6 = [">", getAqi, 300];

const clusterMag1 = ["<=", getAvgAqi, 50]; 
const clusterMag2 = ["all", [">", getAvgAqi, 50], ["<=", getAvgAqi, 100]];
const clusterMag3 = ["all", [">", getAvgAqi, 100], ["<=", getAvgAqi, 150]];
const clusterMag4 = ["all", [">", getAvgAqi, 150], ["<=", getAvgAqi, 200]];
const clusterMag5 = ["all", [">", getAvgAqi, 200], ["<=", getAvgAqi, 300]];
const clusterMag6 = [">", getAvgAqi, 300];


const mapColors = ['#52B947', '#F3EC19', '#F57E1F', '#ED1C24', '#7F2B7E', '#480D27']

export const CIRCLES_LAYER = 'circles';
export const CLUSTERS_COUNT_LAYER = 'clusters-count';
export const PARAMETERS_LAYER = 'parameters';
export const CLUSTERS_LAYER = 'clusters-layer';
export const CLUSTERS_SOURCE = 'clusters-source';

export const addCirclesLayer = (map, parameter) => {
    getMeasurementsFromAllStations(parameter).then(result => {    
        let stations = result.data;
        let geojson = getParameterGeojson(stations, parameter);
        map.addSource(CLUSTERS_SOURCE, 
                {
                    type: "geojson", data: geojson,
                    "cluster": true,
                    "clusterRadius": 45,
                    "clusterProperties": { 
                        "aqi_sum": ["+",  ["get", "aqi"]],
                    }
            });
        map.addLayer(cicrclesLayer());
        map.addLayer(parametersLayer());
        map.addLayer(clustersLayer());
        map.addLayer(clustersCountLayer())
      });
}

export const removeCircles = map => {
    // might want to check all layers
    if (map.getLayer(CIRCLES_LAYER) && map.getLayer(CLUSTERS_COUNT_LAYER)){
        map.removeLayer(CIRCLES_LAYER);
        map.removeLayer(PARAMETERS_LAYER)
        map.removeLayer(CLUSTERS_LAYER)
        map.removeLayer(CLUSTERS_COUNT_LAYER);
        map.removeSource(CLUSTERS_SOURCE);
    }
}

const parametersLayer = () => {
    return {
        id: PARAMETERS_LAYER,
        type: "symbol",
        source: CLUSTERS_SOURCE,
        filter: ["!", ["has", "point_count"]],
        "layout": {
            "text-field": ["number-format", ["get", "aqi"], {"min-fraction-digits": 1, "max-fraction-digits": 1}],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 15
            }
    }   
}

const clustersCountLayer = () => {
    return {
        id: CLUSTERS_COUNT_LAYER,
        type: "symbol",
        source: CLUSTERS_SOURCE,
        filter: ["has", "point_count"],
        layout: {
            "text-field":  ["number-format", ["/", ["get", "aqi_sum"], ["get", "point_count"]],  {"min-fraction-digits": 1, "max-fraction-digits": 1}],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
            }
    };
}

const cicrclesLayer = () => {
    return {
      id: CIRCLES_LAYER,
      type: 'circle',
      source: CLUSTERS_SOURCE,
      filter: ["!", ["has", "point_count"]],
      "paint": {
        "circle-color": ["case",
              mag1, mapColors[0],
              mag2, mapColors[1],
              mag3, mapColors[2],
              mag4, mapColors[3], 
              mag5, mapColors[4],
              mapColors[5]],
        "circle-opacity": 0.8,
        "circle-radius": 20
        }
      }
  }

const clustersLayer = () => {
    return {
        id: CLUSTERS_LAYER,
        type: "circle",
        source: CLUSTERS_SOURCE,
        filter: ["has", "point_count"],
        "paint": {           
                "circle-opacity": 0.4,
                "circle-color": ["case",
                    clusterMag1, mapColors[0],
                    clusterMag2, mapColors[1],
                    clusterMag3, mapColors[2],
                    clusterMag4, mapColors[3], 
                    clusterMag5, mapColors[4],
                    mapColors[5]],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    22,
                    100,
                    30,
                    750,
                    40
                ]
            }
    };
}

