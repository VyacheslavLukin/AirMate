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