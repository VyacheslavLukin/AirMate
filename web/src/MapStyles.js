export const fullscreenControlStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '10px'
  };
  
export const navStyle = {
  position: 'absolute',
  top: 36,
  left: 0,
  padding: '10px'
};


// filters for classifying earthquakes into five categories based on magnitude
const mag1 = ["<", ["get", "mag"], 2];
const mag2 = ["all", [">=", ["get", "mag"], 2], ["<", ["get", "mag"], 3]];
const mag3 = ["all", [">=", ["get", "mag"], 3], ["<", ["get", "mag"], 4]];
const mag4 = ["all", [">=", ["get", "mag"], 4], ["<", ["get", "mag"], 5]];
const mag5 = [">=", ["get", "mag"], 5];
 
// colors to use for the categories
const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];


export const cicrclesLayer = (id, source) => {
  return {
    id,
    type: 'circle',
    source,
    "filter": ["!=", "cluster", true],
    "paint": {
      "circle-color": ["case",
      mag1, colors[0],
      mag2, colors[1],
      mag3, colors[2],
      mag4, colors[3], colors[4]],
      "circle-opacity": 0.6,
      "circle-radius": 12
      }
    }
}

export const heatmapLayer = (id, source) => {
  return {
    id,
    type: 'heatmap',
    source,
    maxzoom: 15,
    paint: {
      // increase weight as diameter breast height increases
      'heatmap-weight': {
        property: 'paramater',
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
        // 0, 'rgba(236,222,239,0)',
        // 0.2, 'rgb(208,209,230)',
        // 0.4, 'rgb(166,189,219)',
        // 0.6, 'rgb(103,169,207)',
        // 0.8, 'rgb(28,144,153)'
        0, 'rgba(255,255,51,0)',
        0.2, 'rgb(255,255,51)',
        0.4, 'rgb(255,153,51)',
        0.6, 'rgb(255,51,51)',
        0.8, 'rgb(255,0,0)'
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