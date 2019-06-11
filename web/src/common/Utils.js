export const getParameterGeojson = (stations, parameter) => {
    console.log('stations', stations);
    let features = []
      stations.forEach(station => {
        let stationGeoFeature =  {
          "type": "Feature",
          "properties": {
            "paramater": station[parameter]
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