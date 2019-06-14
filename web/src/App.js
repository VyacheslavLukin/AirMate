import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup, NavigationControl, FullscreenControl, FlyToInterpolator} from 'react-map-gl';
import {getStationInfoById, getStationsList, getParametersList} from './common/Api';
import {fullscreenControlStyle, navStyle, cicrclesLayer} from './MapStyles';

import {heatmapOnParameter, removeHeatmap, HEATMAP_LAYER} from './layers/Heatmap';
import {MARKERS_LAYER} from './layers/Markers';
import {addCountiesLayer, _onHover, _getCursor} from './layers/Countries';

import MarkerIcon from './marker-icon.png';

import ControlPanel from './components/ControlPanel';

import style from './App.css';

export default class App extends Component {

  constructor(props){
    super(props);
    this._mapRef = React.createRef();
    this.setStartingViewport = this.setStartingViewport.bind(this);
    this.handleLocation = this.handleLocation.bind(this);
    this.toggleHeatmap = this.toggleHeatmap.bind(this);
    this.onCancelSearch = this.onCancelSearch.bind(this);
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
    stations: [],
    currentLayer: null,
    parameters: null,
    layers: ['heatmap', 'markers'],
    currentParameter: null
  }
  
  _onViewportChange = viewport => this.setState({viewport});

  setStations = stations => this.setState({stations});

  setSelectedStation(selectedStation) {
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
    this.setState({
      viewport: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        width: "100vw",
        height: "100vh",
        zoom: 10
      }
    });
    
  }

  componentDidMount() {  
    getStationsList().then(result => {
      this.setStations(result.data)
    });

    getParametersList().then(result => {
      const parametersDict = result.data;
      const parameters = [];
      parametersDict.forEach(entry => {
          parameters.push(entry.parameter);
      });
      parameters.push('-');
      this.setState({ parameters });
    })

    
  }

  _onMapLoad = () => {
    addCountiesLayer(this._getMap());
  }


  getStationFromStateById = (id) => {
    for (let i = 0; i < this.state.stations.length; i++){
      if (this.state.stations[i]['id'] === id) {
        return this.state.stations[i]
      }
    }
    return null;
  }

  getStationPopupText = (id) => {
    const currentItem = this.getStationFromStateById(id);
    if (currentItem == null) {
      return "No info";
    }
    
    let data = this.state.selectedStation;

    let measurements = []
    if (data.measurements){
      data.measurements.forEach(measurement => {
        measurements.push(<div key={measurement.parameter}> {measurement.parameter}: {measurement.value} {measurement.unit} </div>); 
      });
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

  // supposed to be only for heatmap for now
  onCancelSearch = () => {
    if (this.state.currentLayer == HEATMAP_LAYER) {
      removeHeatmap(this._getMap());
      this.setState({
        currentLayer: null
      });
    }
  }

  toggleHeatmap = parameter => {
    if (parameter === '') {
      this.onCancelSearch();
      return;
    }
    this.setState({
      currentLayer: HEATMAP_LAYER
    });

    const map = this._getMap();
    removeHeatmap(map);
    heatmapOnParameter(parameter, map);
  }

  changeParameter = (parameter) => {
    if (parameter === '-'){
      this.onCancelSearch();
    } else {
      this.toggleHeatmap(parameter);
    }
  }

  changeLayer = (layer) => {
    if (layer === HEATMAP_LAYER) {
      this.toggleHeatmap(this.state.currentParameter);
    } else if (layer === MARKERS_LAYER) {

    }
  }

  onMarkerClick = (e, station) => {
    e.preventDefault();
    // set selected station or close it if clicked for the 2nd time
    (this.state.selectedStation && station.id === this.state.selectedStation.id) 
      ? this.setSelectedStation(null) : this.setSelectedStation(station)
  } 

  _onClick = event => {
    if (this._getMap().getZoom() <= 5) {
      console.log('event', event);
      let [longitude, latitude] = event.lngLat;
      this._onViewportChange({
        longitude, 
        latitude,
        zoom: 6,
        transitionInterpolator: new FlyToInterpolator(),
        transitionDuration: 3000
      });
    }
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
          onClick={this._onClick}
          onLoad={this._onMapLoad}
          onHover={_onHover(this._getMap)}
          getCursor={this._getCursor}
          interactiveLayerIds={['countries-layer']}
        >
          
          <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl />
          </div>
          { (this.state.currentLayer == null && this._getMap() && this._getMap().getZoom() > 5) ?
            (
            this.state.stations.map(station => (
              <Marker
                key={station.id}
                latitude={station.latitude}
                longitude={station.longitude}
              >
                <button
                  className={style["marker-btn"]}
                  onClick={(e) => this.onMarkerClick(e, station)}
                >
                  <img src={MarkerIcon} alt="marker icon" />
                </button>
              </Marker>)
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
            {this.state.parameters ? 
              <ControlPanel
              parameters={this.state.parameters}
              layers={this.state.layers}
              changeLayer={this.changeLayer}
              changeParameter={this.changeParameter}
              />
            : null}
         
        </ReactMapGL>
      </div>
    ); 
  }
}