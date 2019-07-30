export const getParameterGeojson = (stations, parameter) => {
    let features = []
      stations.forEach(station => {
        let stationGeoFeature =  {
          "type": "Feature",
          "properties": {
            "id": station.id,
            "parameter": station.measurements.value,
            "sum": 0,
            "aqi": station["aqi"]["value"],
            "aqi_text": station["aqi"]["text"]
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              station.longitude,
              station.latitude
            ]
          }
        };
        features.push(stationGeoFeature);
      });

      let geojson =  {
        "type": "FeatureCollection",
        "features": features
      };
      return geojson;
}

export const colors = ['#52B947AA', '#F3EC19AA', '#F57E1FAA', '#ED1C24AA', '#7F2B7EAA', '#480D27AA'];

export const getColorBasedOnAQI = (aqiValue) => {
  let color;
  if (aqiValue >= 0 && aqiValue <= 50) {
    color = colors[0];
  } else if (aqiValue > 50 && aqiValue <= 100) {
    color = colors[1];
  } else if (aqiValue > 100 && aqiValue <= 150) {
    color = colors[2];
  } else if (aqiValue > 150 && aqiValue <= 200) {
    color = colors[3];
  } else if (aqiValue > 200 && aqiValue <= 300) {
    color = colors[4];
  } else if (aqiValue > 300) {
    color = colors[5];
  } else {
    color = colors[0];
  }
  return color
}