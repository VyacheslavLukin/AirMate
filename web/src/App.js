import React, {Component} from 'react';
import ReactMapGL, {Marker, Popup} from 'react-map-gl';
import './App.css';
import axios from 'axios'

export default class App extends Component {

  constructor(props){
    super(props);

    this._mapRef = React.createRef();

    this.setStartingViewport = this.setStartingViewport.bind(this);
    this.handleLocation = this.handleLocation.bind(this);

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
      this.getStationInfoById(id).then(result => {
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


  getStationsList() {
    return axios.get(`${process.env.REACT_APP_API_URL}/get_stations_list`)
  }

  handleLocation() {
    // TODO: check what happens if one blocks location
    // upd: firefox is ok
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setStartingViewport);
    } else {
      // x.innerHTML = "Geolocation is not supported by this browser.";
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
    //Todo: close popup when escape is pressed. Not important
    // and not complete. One has to remove the listener
    // normally it is done in componentWillMount but it is deprecated..
    // const listener = (e) => {
    //   if (e.key === "Escape") {
    //     this.setSelectedStation(null);
    //   }
    // };  
    // document.addEventListener("keydown", listener, false);
    
    this.getStationsList().then(stations => {
      console.log("stations.data", stations.data)
      this.setStations(stations.data)
    });
  }

  getStationInfoById = (id) => {
    return axios.get(`${process.env.REACT_APP_API_URL}/get_station_data/${id}`);
  }

  getStationFromStateById = (id) => {
    console.log("this.state.stations (getStationFromStateById):", this.state.stations);
    for (let i = 0; i < this.state.stations.length; i++){
      if (this.state.stations[i]['id'] === id) {
        return this.state.stations[i]
      }
    }
    return null
  }

  getStationPopupText = (id) => {
    const currentItem = this.getStationFromStateById(id);

    console.log("currentItem", currentItem);
    if (currentItem == null) {
      return "No info";
    }
    
    let data = this.state.selectedStation;
    // console.log('data.measurements', data.measurements);

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
  
  // _onMapLoad = () => {
  //   const map = this._getMap();
  //   map.addSource(HEATMAP_SOURCE_ID, {type: 'geojson', data: response});
  //   map.addLayer(this._mkHeatmapLayer('heatmap-layer', HEATMAP_SOURCE_ID));
  // }
  
  
  render () {
    
    return (
      <div>
        <ReactMapGL
          {...this.state.viewport}
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/reshreshus/cjwamfl3205ry1cpptvzeyq1e"
          onViewportChange={this._onViewportChange}
          // onLoad={this._onMapLoad}
        >
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