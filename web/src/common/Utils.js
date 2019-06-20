export const getParameterGeojson = (stations, parameter) => {
    console.log('stations', stations);
    let features = []
      stations.forEach(station => {
        let stationGeoFeature =  {
          "type": "Feature",
          "properties": {
            "id": station.id,
            "parameter": station[parameter],
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