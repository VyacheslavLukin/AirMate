import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup, NavigationControl, FullscreenControl, FlyToInterpolator} from 'react-map-gl';
import {getStationInfoById, getStationsList, getParametersList} from './common/Api';
import {fullscreenControlStyle, navStyle} from './MapStyles';

import {heatmapOnParameter, removeHeatmap, HEATMAP_LAYER} from './layers/Heatmap';
import {addCirclesLayer, CIRCLES_LAYER, removeCircles, PARAMETERS_LAYER, CLUSTERS_LAYER} from './layers/Circles'

import {MARKERS_LAYER} from './layers/Markers';

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
    this._onClick = this._onClick.bind(this);
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
    selectedLayer: CIRCLES_LAYER,
    parameters: null,
    layers: [MARKERS_LAYER, HEATMAP_LAYER, CIRCLES_LAYER],
    selectedParameter: null
  }
  
  _onViewportChange = viewport => this.setState({viewport});

  setStations = stations => this.setState({stations});

  setSelectedStationById = id => {
    getStationInfoById(id).then(result => {
      const stationInfo = result.data;
      stationInfo.id = id;
      stationInfo.latitude = stationInfo.coordinates.latitude;
      stationInfo.longitude = stationInfo.coordinates.longitude;
      delete stationInfo['coordinates'];
      this.setState({
        selectedStation: stationInfo
      });
    });
  }

  setSelectedStation(selectedStation) {
    if (selectedStation == null) {
      this.setState({selectedStation}); //null
    } else {
      let id = selectedStation['id'];
      this.setSelectedStationById(id);

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
    // addCirclesLayer(this.state.selectedParameter, this._getMap());
    // addCountiesLayer(this._getMap());
    // const map = this._getMap();
    // map.on('mouseenter', CLUSTERS_LAYER, function () {
    //   map.getCanvas().style.cursor = 'pointer';
    //   });
    // map.on('hover', PARAMETERS_LAYER, function () {
    //   map.getCanvas().style.cursor = 'pointer';
    //   });
    // map.on('mouseenter', 'clusters', function () {
    //   map.getCanvas().style.cursor = 'pointer';
    // });
    // map.on('mouseleave', 'clusters', function () {
    //   map.getCanvas().style.cursor = '';
    // });
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
    if (this.state.selectedLayer == HEATMAP_LAYER) {
      removeHeatmap(this._getMap());
      this.setState({
        selectedLayer: null
      });
    }
  }

  toggleHeatmap = parameter => {
    if (parameter === '') {
      this.onCancelSearch();
      return;
    }
    this.setState({
      selectedLayer: HEATMAP_LAYER
    });

    const map = this._getMap();
    removeHeatmap(map);
    heatmapOnParameter(parameter, map);
  }

  changeParameter = (parameter) => {
    //TODO: make switch case
    if (this.state.selectedLayer === HEATMAP_LAYER){
      if (parameter === '-'){
        this.onCancelSearch();
      } else {
        this.toggleHeatmap(parameter);
      }
    } else if (this.state.selectedLayer === CIRCLES_LAYER) {
      //TODO there are ways to do it more efficiently
      removeCircles(this._getMap());
      addCirclesLayer(parameter, this._getMap());
    }
    this.setState({
      selectedParameter: parameter
    });
  }

  changeLayer = (layer) => {
    if (this.state.selectedLayer == HEATMAP_LAYER){
      removeHeatmap(this._getMap());
    } else if (this.state.selectedLayer == CIRCLES_LAYER) {
      removeCircles(this._getMap());
    }
    this.setState({
      selectedLayer: layer
    });
    if (layer === HEATMAP_LAYER) {
      this.toggleHeatmap(this.state.selectedParameter);
    } else if (layer === CIRCLES_LAYER) {
      addCirclesLayer(this.state.selectedParameter, this._getMap());
    }
  }

  onMarkerClick = (e, station) => {
    e.preventDefault();
    // set selected station or close it if clicked for the 2nd time
    (this.state.selectedStation && station.id === this.state.selectedStation.id) 
      ? this.setSelectedStation(null) : this.setSelectedStation(station)
  } 

  _onClick = event => {
    event.preventDefault();
    const point = [event.center.x, event.center.y];
    const map = this._getMap();
    const cluster = map.queryRenderedFeatures(point, { layers: [CLUSTERS_LAYER] })[0];
    
    if (cluster) {
      console.log('cluster', cluster);

      const clusterId = cluster.properties.cluster_id;
      console.log('clusterId', clusterId);
      let that = this
      map.getSource('clusters-source').getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err)
          return;
        map.easeTo({
          center: cluster.geometry.coordinates,
          // around: cluster.geometry.coordinates,  
          zoom: zoom,
          duration: 1000
        });
        console.log('zoom', zoom);
        // map.easeTo doesn't change viewport even if it zooms - strange. Perhaps, a bug
          setTimeout(function(){
            that._onViewportChange({
              longitude: cluster.geometry.coordinates[0], 
              latitude: cluster.geometry.coordinates[1],
              zoom: zoom,
              width: "100vw",
              height: "100vh",
              // transitionInterpolator: new FlyToInterpolator(),
              // transitionDuration: 3000
            });
        }, 1000);
      });
     
      
    } else {
      const parametersLayer = map.queryRenderedFeatures(point, { layers: [PARAMETERS_LAYER] })[0];
      if (parametersLayer) {
      
        console.log('parametersLayer', parametersLayer);
        // setTimeout(function(){
          (this.state.selectedStation && (parametersLayer.properties.id === this.state.selectedStation.id))
          ? this.setSelectedStation(null) : this.setSelectedStationById(parametersLayer.properties.id);
        // }, 100);
      }
    }
  }

  _getCursor = ({isHovering, isDragging}) => {
    return isHovering ? 'pointer' : '';
  };
  
  
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
          getCursor={this._getCursor}
          interactiveLayerIds={[PARAMETERS_LAYER, CLUSTERS_LAYER]}
        >
          
          <div className="fullscreen" style={fullscreenControlStyle}>
          <FullscreenControl />
          </div>
          <div className="nav" style={navStyle}>
            <NavigationControl />
          </div>
          { (this.state.selectedLayer == MARKERS_LAYER && this._getMap() && this._getMap().getZoom() > 5) ?
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
            {this.state.parameters && this.state.layers ? 
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