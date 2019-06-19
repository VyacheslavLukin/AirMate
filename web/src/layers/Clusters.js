import {getParameterGeojson} from '../common/Utils';
import {getMeasurementsFromAllStations} from '../common/Api';

const mag1 = ["<", ["get", "parameter"], 20];
const mag2 = ["all", [">=", ["get", "parameter"], 20], ["<", ["get", "parameter"], 30]];
const mag3 = ["all", [">=", ["get", "parameter"], 30], ["<", ["get", "parameter"], 40]];
const mag4 = ["all", [">=", ["get", "parameter"], 40], ["<", ["get", "parameter"], 50]];
const mag5 = [">=", ["get", "parameter"], 50];

const cluterMag1 = ["<", ["/", ["get", "sum"], ["get", "point_count"]], 20];
const cluterMag2 = ["all", [">=", ["/", ["get", "sum"], ["get", "point_count"]], 20], ["<", ["/", ["get", "sum"], ["get", "point_count"]], 30]];
const cluterMag3 = ["all", [">=", ["/", ["get", "sum"], ["get", "point_count"]], 30], ["<", ["/", ["get", "sum"], ["get", "point_count"]], 40]];
const cluterMag4 = ["all", [">=", ["/", ["get", "sum"], ["get", "point_count"]], 40], ["<", ["/", ["get", "sum"], ["get", "point_count"]], 50]];
const cluterMag5 = [">=", ["/", ["get", "sum"], ["get", "point_count"]], 50];


// colors to use for the categories
// TODO: better to use different parameters for different colors (I guess)
const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

export const CIRCLES_LAYER = 'circles';
export const CLUSTERS_COUNT_LAYER = 'clusters-count';
export const PARAMETERS_LAYER = 'parameters';
export const CLUSTERS_LAYER = 'clusters-layer';
export const CLUSTERS_SOURCE = 'clusters-source';

export const addCirclesLayer = (parameter, map) => {
    getMeasurementsFromAllStations(parameter).then(result => {    
        let stations = result.data;
        let geojson = getParameterGeojson(stations, parameter);
        map.addSource(CLUSTERS_SOURCE, 
                {
                    type: "geojson", data: geojson,
                    "cluster": true,
                    "clusterRadius": 45,
                    "clusterProperties": { 
                        "sum": ["+",  ["get", "parameter"]],
                    }
            });
        map.addLayer(cicrclesLayer());
        map.addLayer(parametersLayer());
        map.addLayer(clustersLayer());
        map.addLayer(clustersCountLayer())
      });
}

export const removeCircles = map => {
    //TODO
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
            "text-field": ["number-format", ["get", "parameter"], {"min-fraction-digits": 1, "max-fraction-digits": 1}],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-size": 15
            },
        // "paint": {
        //     "text-color": ["case", ["<", ["get", "parameter"], 3], "black", "white"]
        // }
    }   
}

const clustersCountLayer = () => {
    return {
        id: CLUSTERS_COUNT_LAYER,
        type: "symbol",
        source: CLUSTERS_SOURCE,
        filter: ["has", "point_count"],
        layout: {
            "text-field":  ["number-format", ["/", ["get", "sum"], ["get", "point_count"]],  {"min-fraction-digits": 1, "max-fraction-digits": 1}],
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
      // "filter": ["!=", "cluster", true],
      filter: ["!", ["has", "point_count"]],
      "paint": {
        "circle-color": ["case",
              mag1, colors[0],
              mag2, colors[1],
              mag3, colors[2],
              mag4, colors[3], 
              colors[4]],
        "circle-opacity": 0.6,
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
            
                "circle-color": "#51bbd6",
                "circle-color": ["case",
                cluterMag1, colors[0],
                cluterMag2, colors[1],
                cluterMag3, colors[2],
                cluterMag4, colors[3], 
                    colors[4]],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
    };
}

