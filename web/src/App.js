import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup, NavigationControl, FullscreenControl} from 'react-map-gl';
import {getStationInfoById, getStationsList} from './common/Api';
import {fullscreenControlStyle, navStyle, _mkHeatmapLayer} from './MapStyles';

const HEATMAP_SOURCE_ID = 'o3';

export default class App extends Component {

  constructor(props){
    super(props);

    this._mapRef = React.createRef();

    this.setStartingViewport = this.setStartingViewport.bind(this);
    this.handleLocation = this.handleLocation.bind(this);

    this._onMapLoad = this._onMapLoad.bind(this);

    this.handleLocation();
  }

  state = {
    viewport: { //initial point is hardcoded
      latitude: 52.54304, 
      longitude: 13.349326,
      width: "100vw",
      height: "100vh",
      zoom: 10
    },
    selectedStation: null,
    stations: []
  }
  
  _onViewportChange = viewport => this.setState({viewport});

  setStations = stations => this.setState({stations});

  setSelectedStation(selectedStation) {
    console.log("selectedStation: ", selectedStation);
   
    if (selectedStation == null) {
      this.setState({selectedStation}); //null
    } else {
      let id = selectedStation['id'];
      getStationInfoById(id).then(result => {
        const stationInfo = result.data;
        stationInfo.id = selectedStation.id;
        stationInfo.latitude = stationInfo.coordinates.latitude;
        stationInfo.longitude = stationInfo.coordinates.longitude;
        delete stationInfo['coordinates'];
        this.setState({
          selectedStation: stationInfo
        });
    });
    }  
  }

  handleLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setStartingViewport);
    } 
  }

  setStartingViewport(position) {
    console.log('requested position', position);
    this.setState({
      viewport: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        width: "100vw",
        height: "100vh",
        zoom: 10
      }
    }, console.log('viewport', this.state.viewport));
    
  }

  componentDidMount() {  
    getStationsList().then(stations => {
      console.log("stations.data", stations.data)
      this.setStations(stations.data)
    });
  }


  getStationFromStateById = (id) => {
    console.log("this.state.stations (getStationFromStateById):", this.state.stations);
    for (let i = 0; i < this.state.stations.length; i++){
      if (this.state.stations[i]['id'] === id) {
        return this.state.stations[i]
      }
    }
    return null;
  }

  getStationPopupText = (id) => {
    const currentItem = this.getStationFromStateById(id);

    console.log("currentItem", currentItem);
    if (currentItem == null) {
      return "No info";
    }
    
    let data = this.state.selectedStation;

    let measurements = []
    if (data.measurements){
      data.measurements.forEach(measurement => {
        measurements.push(<div key={measurement.parameter}> {measurement.parameter}: {measurement.value} {measurement.unit} </div>); 
      });
    } else {
      //TODO
      // measuresString = JSON.stringify(data);
    }
     let popupContent = 
    <div key={currentItem.last_txid}>  
      ID: {currentItem.id} <br/>
      Transaction hash: ${currentItem.last_txid}<br/>
      Latitude: {currentItem.latitude}<br/>
      Longitude: {currentItem.longitude}<br/>
      {measurements}
    </div>
    return popupContent;
  }

  _getMap = () => {
    return this._mapRef.current ? this._mapRef.current.getMap() : null;
  };  
  
  _onMapLoad = () => {
    const map = this._getMap();
    let promises = []
    let stations = this.state.stations;
    for(let i = 0; i < stations.length; i++){
      //TODO: this is just for experimenting
      // in future, of course, a signle request will be used
      let featurePromise = getStationInfoById(stations[i].id);
      promises.push(featurePromise);
    }

    Promise.all(promises.map(p => p.catch(e => e))).then(
      results => {
        let features = []
        for (let i = 0; i < results.length; i++){
          if (results[i] && results[i].data && results[i].data.measurements){
            console.log('results[i].data', results[i].data);
            let measurements = results[i].data.measurements;
            for (let j = 0; j < measurements.length; j++) {
              if (measurements[j].parameter === "o3") {
                let stationGeoFeature =  {
                  "type": "Feature",
                  "properties": {
                    "paramater": measurements[j].value
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [
                      stations[i].longitude,
                      stations[i].latitude
                      
                    ]
                  }
                };
                features.push(stationGeoFeature);
              }
            }
          }
        }
        console.log('features', features);
        let data = {
          "type": "FeatureCollection",
          "features": features
        }

        console.log('data', data);
        map.addSource(HEATMAP_SOURCE_ID, {type: 'geojson', data: data});
        map.addLayer(_mkHeatmapLayer('heatmap-layer', HEATMAP_SOURCE_ID));
      }); 
  }
  
  render () { 
    return (
      <div>
        <ReactMapGL
          ref={this._mapRef}
          {...this.state.viewport}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/reshreshus/cjwamfl3205ry1cpptvzeyq1e"
          onViewportChange={this._onViewportChange}
          // onLoad={this._onMapLoad}
        >
          
          <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl />
          </div>
        <div>
            <button style={{position: 'absolute', top: 10, left: 55, padding: '5px'}} onClick={this._onMapLoad}> test heatmap on o3 </button>
        </div>


          {this.state.stations.map(station => (
              <Marker
                key={station.id}
                latitude={station.latitude}
                longitude={station.longitude}
              >
                <button
                  className="marker-btn"
                  onClick={e => {
                    e.preventDefault();
                    // set selected station or close it if clicked for the 2nd time
                    (this.state.selectedStation && station.id===this.state.selectedStation.id) 
                      ? this.setSelectedStation(null) : this.setSelectedStation(station)
                  }}
                >
                  <img src="img/marker-icon.png" alt="marker icon" />
                </button>
              </Marker>
            ))}
  
          {this.state.selectedStation ? (
            
            <Popup
              latitude={this.state.selectedStation.latitude}
              longitude={this.state.selectedStation.longitude}
              onClose={() => {
                this.setSelectedStation(null);
              }}
            >
              <div>
                {this.getStationPopupText(this.state.selectedStation.id)}
              </div>
            </Popup>
          ) : null}
        </ReactMapGL>
      </div>
    ); 
  }
  
}