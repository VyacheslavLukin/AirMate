import {getParameterGeojson} from '../common/Utils';
import {getMeasurementsFromAllStations} from '../common/Api';

const mag1 = ["<", ["get", "parameter"], 20];
const mag2 = ["all", [">=", ["get", "parameter"], 20], ["<", ["get", "parameter"], 30]];
const mag3 = ["all", [">=", ["get", "parameter"], 30], ["<", ["get", "parameter"], 40]];
const mag4 = ["all", [">=", ["get", "parameter"], 40], ["<", ["get", "parameter"], 50]];
const mag5 = [">=", ["get", "parameter"], 50];
 
// colors to use for the categories
// TODO: better to use different parameters for different colors (I guess)
const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

export const CIRCLES_LAYER = 'circles';
export const CLUSTERS_COUNT_LAYER = 'clusters-count';
export const PARAMETERS_LAYER = 'parameters';
export const CLUSTERS_LAYER = 'clusters-layer';
export const SOURCE = 'clusters-source';

export const addCirclesLayer = (parameter, map) => {
    getMeasurementsFromAllStations(parameter).then(result => {    
        let stations = result.data;
        let geojson = getParameterGeojson(stations, parameter);
        map.addSource(SOURCE, 
                {
                    type: "geojson", data: geojson,
                    "cluster": true,
                    "clusterRadius": 50,
                    "clusterProperties": { // keep separate counts for each magnitude category in a cluster
                        "mag1": ["+", ["case", mag1, 1, 0]],
                        "mag2": ["+", ["case", mag2, 1, 0]],
                        "mag3": ["+", ["case", mag3, 1, 0]],
                        "mag4": ["+", ["case", mag4, 1, 0]],
                        "mag5": ["+", ["case", mag5, 1, 0]],


                        // "max": ["max", ["get", "parameter"]],
                        "sum": ["+", ["get", "parameter"]],
                        // "has_island": ["any", ["==", ["get", "featureclass"], "island"]]
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
        map.removeSource(SOURCE);
    }
}

const parametersLayer = () => {
    return {
        id: PARAMETERS_LAYER,
        type: "symbol",
        source: SOURCE,
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
        source: SOURCE,
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
            }
    };
}

const cicrclesLayer = () => {
    return {
      id: CIRCLES_LAYER,
      type: 'circle',
      source: SOURCE,
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
        source: SOURCE,
        filter: ["has", "point_count"],
        "paint": {
                "circle-color": "#51bbd6",
                // [
                //     "step",
                //     ["get", "point_count"],
                //     "#51bbd6",
                //     100,
                //     "#f1f075",
                //     750,
                //     "#f28cb1"
                // ],
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
