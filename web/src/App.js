import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup, NavigationControl, FullscreenControl} from 'react-map-gl';
import {getStationInfoById, getStationsList, getMeasurementsFromAllStations} from './common/Api';
import {fullscreenControlStyle, navStyle, heatmapLayer, cicrclesLayer} from './MapStyles';


import MarkerIcon from './marker-icon.png';

// import SearchBar from './components/searchMaterialUI';
import SearchBar from './components/SearchBar';

import style from './App.css';
// require('style-loader!App.css');

const HEATMAP_SOURCE_ID = 'patameter_heatmap';

export default class App extends Component {

  constructor(props){
    super(props);

    this._mapRef = React.createRef();

    this.setStartingViewport = this.setStartingViewport.bind(this);
    this.handleLocation = this.handleLocation.bind(this);

    // this._onMapLoad = this._onMapLoad.bind(this);
    this.heatMapOnParamter = this.heatMapOnParamter.bind(this);

    this.onCancelSearch = this.onCancelSearch.bind(this);

    this.handleLocation();

    console.log('mapbox token', process.env.REACT_APP_MAPBOX_TOKEN);
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
    stations: [],
    overlayIsOn: false,
    layerId: 'heatmap'
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

  onCancelSearch = () => {
    if (this.state.overlayIsOn) {
      const map = this._getMap();
      map.removeLayer('heatmap-layer');
      map.removeSource(HEATMAP_SOURCE_ID);
      this.setState({
        overlayIsOn: false
      });
    }
  }
  
  heatMapOnParamter = (parameter) => {
    if (parameter === '') this.onCancelSearch();
    const map = this._getMap();
    
    // let stations = this.state.stations;
    let features = []
    getMeasurementsFromAllStations(parameter).then(result => {
      let stations = result.data;
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

      console.log('features', features);
      let data = {
        "type": "FeatureCollection",
        "features": features
      }

      console.log('data', data);
      if (this.state.overlayIsOn) {
        
        map.removeLayer('heatmap-layer');

        map.removeSource(HEATMAP_SOURCE_ID);
        
        console.log('removed source');
      } else {
        this.setState({
          overlayIsOn: true
        });
        console.log('overlayIsOn', this.state.overlayIsOn);
      }
      map.addSource(HEATMAP_SOURCE_ID, {type: 'geojson', data: data});
      map.addLayer(heatmapLayer('heatmap-layer', HEATMAP_SOURCE_ID));
      // map.addLayer(cicrclesLayer(this.state.layerId, HEATMAP_SOURCE_ID));
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
        >
          
          <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl />
          </div>
        <div>
            {/* <button style={{position: 'absolute', top: 10, left: 55, padding: '5px'}} onClick={this._onMapLoad}> test heatmap on o3 </button> */}
        </div>

          
          { !this.state.overlayIsOn ?
            this.state.stations.map(station => (
              <Marker
                key={station.id}
                latitude={station.latitude}
                longitude={station.longitude}
              >
                <button
                  className={style["marker-btn"]}
                  onClick={e => {
                    e.preventDefault();
                    // set selected station or close it if clicked for the 2nd time
                    (this.state.selectedStation && station.id===this.state.selectedStation.id) 
                      ? this.setSelectedStation(null) : this.setSelectedStation(station)
                  }}
                >
                  <img src={MarkerIcon} alt="marker icon" />
                </button>
              </Marker>
            )) : null}
  
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
          <div className={style["search-parameters"]}>
            <SearchBar onRequestSearch={this.heatMapOnParamter} style={{marginLeft: 'auto'}} 
            placeholder="Test heatmap on a paramter"
            onCancelSearch={this.onCancelSearch}/>
          </div>
         
        </ReactMapGL>
      </div>
    ); 
  }
}