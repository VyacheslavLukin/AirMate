import style from './App.css';
import mapboxStyle from '../public/css/mapbox-gl.css';
import MarkerIcon from './marker-icon.png';

import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup, NavigationControl, FullscreenControl, FlyToInterpolator} from 'react-map-gl';

import {getStationInfoById, getStationsList, getParametersList} from './common/Api';
import {fullscreenControlStyle, navStyle} from './MapStyles';

import {addHeatmap, removeHeatmap, HEATMAP_LAYER} from './layers/Heatmap';
import {addCirclesLayer, CIRCLES_LAYER, removeCircles, CLUSTERS_LAYER} from './layers/Clusters'
import {MARKERS_LAYER} from './layers/Markers';

import ControlPanel from './components/ControlPanel';
import {getStationPopupContent, getHistoryPopup} from './components/PopupComponent';

// import PersonalChart from './components/PersonalChart';



import AqiTable from './components/AqiTable';

const interactiveLayerIdsClusters = [CIRCLES_LAYER, CLUSTERS_LAYER]

export default class App extends Component {

  constructor(props){
    super(props);
    this._mapRef = React.createRef();
    this.setStartingViewport = this.setStartingViewport.bind(this);
    this.handleLocation = this.handleLocation.bind(this);
    this.changeLayer = this.changeLayer.bind(this);
    this.changeParameter = this.changeParameter.bind(this);
    this._onClick = this._onClick.bind(this);
    this.handleLocation();
  }

  state = {
    viewport: { //initial point is hardcoded
      latitude: 39.1175, 
      longitude: -94.6356,
      width: "100vw",
      height: "100vh",
      zoom: 10
    },
    popupStationInfo: null,
    stations: [],
    selectedLayer: CIRCLES_LAYER,
    interactiveLayerIds: null,
    parameters: null,
    layers: [MARKERS_LAYER, HEATMAP_LAYER, CIRCLES_LAYER],
    selectedParameter: '-',
    aqiTableIsShown: false,
    selectedStationId: null
  }
  
  _onViewportChange = viewport => this.setState({viewport});

  setStations = stations => this.setState({stations});

  setPopupStationInfoByIdAndAqi = (id, param_aqi) => {
    // TODO: try memoization?
    getStationInfoById(id).then(result => {
      const stationInfo = result.data;
      stationInfo.id = id;
      stationInfo.latitude = stationInfo.coordinates.latitude;
      stationInfo.longitude = stationInfo.coordinates.longitude;
      delete stationInfo['coordinates'];
      stationInfo.param_aqi = param_aqi;
      stationInfo.parameter = this.state.selectedParameter;
      this.setState({
        popupStationInfo: stationInfo
      });
    });
    
  }

  setPopupStationInfo(popupStationInfo) {
    if (popupStationInfo == null) {
      this.setState({popupStationInfo}); //null
    } else {
      let id = popupStationInfo['id'];
      this.setPopupStationInfoByIdAndAqi(id);

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
      this.setState({ parameters: [...result.data, '-'] });
    })
  }


  getStationFromStateById = (id) => {
    for (let i = 0; i < this.state.stations.length; i++){
      if (this.state.stations[i]['id'] === id) {
        return this.state.stations[i]
      }
    }
    return null;
  }

  getStationPopupContent = (id) => {
    
    const currentItem = this.getStationFromStateById(id);
    if (!currentItem) {
      return "No info";
    }

    let station = this.state.popupStationInfo
    station.last_txid = currentItem.last_txid;
    station.id = currentItem.id; //?
    station.longitude = currentItem.longitude;
    station.latitude = currentItem.latitude;
    // station.param_aqi = 


    return getStationPopupContent(station);
  }

  _getMap = () => {return this._mapRef.current ? this._mapRef.current.getMap() : null;}

  changeParameter = (parameter) => {
    this.toggleLayerAndParameter(this.state.selectedLayer, parameter);
    this.setState({
      selectedParameter: parameter
    });
  }

  changeLayer = (layer) => {
    this.setState({
      selectedLayer: layer
    });
    this.toggleLayerAndParameter(layer, this.state.selectedParameter);
  }

  toggleLayerAndParameter = (layer, parameter) => {
    if (this.state.selectedLayer === HEATMAP_LAYER){
      removeHeatmap(this._getMap());
    } else if (this.state.selectedLayer === CIRCLES_LAYER) {
      removeCircles(this._getMap());
      if (layer !== CIRCLES_LAYER) {
        this.setState({
          interactiveLayerIds: null
        })
      }
    }
    if (parameter !== '-') {
      if (layer === HEATMAP_LAYER) {
        addHeatmap(this._getMap(), parameter);
      } else if (layer === CIRCLES_LAYER) {
        addCirclesLayer(this._getMap(), parameter);
        this.setState({
          interactiveLayerIds: interactiveLayerIdsClusters
        })
      }
    }
  }

  onMarkerClick = (e, station) => {
    e.preventDefault();
    // set selected station or close it if clicked for the 2nd time
    (this.state.popupStationInfo && station.id === this.state.popupStationInfo.id) 
      ? this.setPopupStationInfo(null) : this.setPopupStationInfo(station)
  } 

  _onClick = e => {
    e.stopPropagation();

    const point = [e.center.x, e.center.y];
    const map = this._getMap();
    const cluster = map.queryRenderedFeatures(point, { layers: [CLUSTERS_LAYER] })[0];
    
    if (cluster) {
      // console.log('cluster', cluster);
      const clusterId = cluster.properties.cluster_id;
      let that = this
      map.getSource('clusters-source').getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err)
          return;
        map.easeTo({
          center: cluster.geometry.coordinates,
          zoom: zoom,
          duration: 1000
        });
        //TODO: try with flying and not easing
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
    } 
    else {
      const cicrlesLayer = map.queryRenderedFeatures(point, { layers: [CIRCLES_LAYER] })[0];
      if (cicrlesLayer) {  
        console.log('cicrlesLayer', cicrlesLayer);
        // (this.state.popupStationInfo && (cicrlesLayer.properties.id === this.state.popupStationInfo.id))
        // ? this.setPopupStationInfo(null) : this.setPopupStationInfoByIdAndAqi(cicrlesLayer.properties.id);
        // this.setState({
        //   historyPopupIsShown: true
        // })
        // this.setPopupStationInfo(null);
        // this.setPopupStationInfoByIdAndAqi(cicrlesLayer.properties.id)
        this.setState({
          selectedStationId: null 
        });
        this.setState({
          selectedStationId: cicrlesLayer.properties.id
        });
      } else {
        // this.setState({
        //   historyPopupIsShown: false
        // })
        // this.setPopupStationInfo(null);
        this.setState({
          selectedStationId: null
        });
      }

    }
  }

  _onHover = (e) => {
    //TODO: for some reasons it flickers when moving the mouse fast
    e.stopPropagation();
  
    const point = [e.center.x, e.center.y];
    const map = this._getMap();
    const cicrlesLayer = map.queryRenderedFeatures(point, { layers: [CIRCLES_LAYER] })[0];
    if (cicrlesLayer) {  
      // console.log(cicrlesLayer);
      // this.setPopupStationInfo(null);
      // setTimeout(() => {
        
        let param_aqi = {
          value: cicrlesLayer.properties.aqi,
          text: cicrlesLayer.properties.aqi_text
        }
        this.setPopupStationInfoByIdAndAqi(cicrlesLayer.properties.id, param_aqi)
      // }, 200)
    } else {
      // setTimeout(() => {
        // this.setPopupStationInfo(null);
        this.setState({
          popupStationInfo: null
        })
      // }, 300);
      
    }
  }

  _getCursor = ({isHovering, isDragging}) => {
    return isHovering ? 'pointer' : 'grab';
  };

  _renderHistoryPopup() {
    if (this.state.selectedStationId) {
      // console.log("why");
      return (
        <div>
        {getHistoryPopup(this.state.selectedStationId, this.state.parameters)}
      </div>
      );
    }
    return null;
  }

  _renderPopup() {
    const {popupStationInfo} = this.state;
    if (popupStationInfo && !this.state.selectedStationId) {
      
      return (
        <Popup
          latitude={popupStationInfo.latitude}
          longitude={popupStationInfo.longitude}
          closeButton={false}
          >
          <div>
            {this.getStationPopupContent(popupStationInfo.id)}
          </div>
        </Popup>
      );
    }
    return null;
  }
  
  
  render () { 
    return (
      <div className={mapboxStyle['mapboxgl-canvas']}>
        <ReactMapGL
          
          key="map"
          ref={this._mapRef}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/reshreshus/cjwamfl3205ry1cpptvzeyq1e"
          onViewportChange={this._onViewportChange}
          onClick={this._onClick}
          // onLoad={this._onMapLoad}
          onHover={this._onHover}
          getCursor={this._getCursor}
          interactiveLayerIds={this.state.interactiveLayerIds}
          {...this.state.viewport}
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
                  // className={style["marker-btn"]}
                  className="marker-btn"
                  onClick={(e) => this.onMarkerClick(e, station)}
                >
                  <img src={MarkerIcon} alt="marker icon" />
                </button>
              </Marker>)
            )) : null}
  
          {/* {this.state.popupStationInfo ? (
            
            <Popup
              latitude={this.state.popupStationInfo.latitude}
              longitude={this.state.popupStationInfo.longitude}
              onClose={() => {
                this.setPopupStationInfo(null);
              }}
            >
              <div>
                {this.getStationPopupContent(this.state.popupStationInfo.id)}
              </div>
            </Popup>
          ) : null} */}
          {this._renderPopup()}
         
            
        </ReactMapGL>
        {this._renderHistoryPopup()}
        <div
         key="panel" 
        // className={style['panel']}
        className='panel'
        >
          {this.state.parameters && this.state.layers ? 
                <ControlPanel
                parameters={this.state.parameters}
                layers={this.state.layers}
                changeLayer={this.changeLayer}
                changeParameter={this.changeParameter}
                />
            : null}
          
        </div>
        {(this.state.selectedLayer === CIRCLES_LAYER && this.state.selectedParameter !== '-') 
          ? <AqiTable/> : null}
      </div>
    ); 
  }
}