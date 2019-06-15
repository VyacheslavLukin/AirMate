export const getParameterGeojson = (stations, parameter) => {
    console.log('stations', stations);
    let features = []
      stations.forEach(station => {
        let stationGeoFeature =  {
          "type": "Feature",
          "properties": {
            "id": station.id,
            "parameter": station[parameter],
            "test": "this info is just to test if I can see it"
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