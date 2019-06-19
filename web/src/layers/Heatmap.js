import {getParameterGeojson} from '../common/Utils';
import {getMeasurementsFromAllStations} from '../common/Api';

const HEATMAP_SOURCE = 'heatmap-source';
export const HEATMAP_LAYER = 'heatmap';

const colors = ['#52B947', '#F3EC19', '#F57E1F', '#ED1C24', '#7F2B7E', '#480D27']

export const addHeatmap = (map, parameter) => {
    getMeasurementsFromAllStations(parameter).then(result => {    
      let stations = result.data;
      let geojson = getParameterGeojson(stations, parameter);
      map.addSource(HEATMAP_SOURCE, {type: 'geojson', data: geojson});
      map.addLayer(heatmapLayer(HEATMAP_LAYER, HEATMAP_SOURCE));
    });
  }

export const removeHeatmap = map => {
    if (map.getLayer(HEATMAP_LAYER) != null){
        map.removeLayer(HEATMAP_LAYER);
        map.removeSource(HEATMAP_SOURCE);
    }
}

const heatmapLayer = (id, source) => {
    return {
      id,
      type: 'heatmap',
      source,
      // maxzoom: 15,
      paint: {
        // increase weight as diameter breast height increases
        'heatmap-weight': {
          property: 'aqi',
          type: 'exponential',
          stops: [
            [1, 0],
            [62, 1]
          ]
        },
        // increase intensity as zoom level increases
        'heatmap-intensity': {
          stops: [
            [11, 1],
            [15, 3]
          ]
        },
        // assign color values be applied to points depending on their density
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(255,255,51,0)' ,
          0.2, colors[1],
          0.4, colors[2],
          0.6, colors[3],
          0.8, colors[4]
          // 0, 'rgba(255,255,51,0)',
          // 0.2, 'rgb(255,255,51)',
          // 0.4, 'rgb(255,153,51)',
          // 0.6, 'rgb(255,51,51)',
          // 0.8, 'rgb(255,0,0)'
        ]
        ,
        // increase radius as zoom increases
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        },
        // decrease opacity to transition into the circle layer
        'heatmap-opacity': {
          default: 1,
          stops: [
            [14, 1],
            [15, 0]
          ]
        },
      }
    };
  }