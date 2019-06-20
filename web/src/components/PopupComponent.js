import style from './Popup.css';


export const getStationPopupContent = (stationInfo) => {
    let measurements = []
    if (stationInfo.measurements){
      stationInfo.measurements.forEach(measurement => {
        measurements.push(<div key={measurement.parameter}> {measurement.parameter}: {measurement.value} {measurement.unit} </div>); 
      });
    }

     let popupContent = 
    <div key={stationInfo.last_txid}>  
      ID: {stationInfo.id} <br/>
      Transaction hash: ${stationInfo.last_txid}<br/>
      Latitude: {stationInfo.latitude}<br/>
      Longitude: {stationInfo.longitude}<br/>
      {measurements}
    </div>
    // return popupContent;
    // console.log('stationInfo', stationInfo);
    popupContent = 
        <div className={style['popup-container']}>
              {/* <h1> AirMate</h1> */}
              <h3>{stationInfo.city}, {stationInfo.country} | {stationInfo.id}</h3>
              <hr/>
              {stationInfo.aqi ? (
                <div> 
                  <p>Air Quility Index: {stationInfo.aqi}</p>
                  <p>{getAirQuilityDescription()}</p>
                </div>
              )
              : <div> Aqi: <spin style={{backgroundColor: 'green'}}> Good anyway </spin> </div>}
              <br/>
              updated: <spin style={{backgroundColor: 'red', opacity: 0.6}}> who knows when </spin> <br/>or wait we need to show when a particular parameter updated..
              <hr/>
              Click for more information
              <hr/>
              {measurements}
              {/* <div className={style["interior"]}>
                  <a className={style["btn"]} href="#open-modal">👋 Basic CSS-Only Modal</a>
              </div> */}
      
              {/* <div id="open-modal" className={style["modal-window"]}>
                  <div>
                      <a href="#" title="Close" className={style["modal-close"]}>Close</a>
                      <h1>Voilà!</h1>
                      <div>A CSS-only modal based on the :target pseudo-class. Hope you find it helpful.</div>
                      <div><small>Sponsor</small></div>
                      <a href="https://aminoeditor.com" target="_blank">👉 Amino: Live CSS Editor for Chrome</a>
                  </div>
              </div> */}
        </div>
    return popupContent;
  }

const getAirQuilityDescription = (aqi) => {
  switch (aqi) {
    case (aqi > 0 && aqi <= 50):
      return "Good";
    case (aqi > 50 && aqi <= 100):
      return "Moderate";
    case (aqi > 100 && aqi <= 150):
      return "Unhealthy for sensitive people";
    case (aqi > 150 && aqi <= 200):
      return "Unhealthy";
    case (aqi > 200 && aqi <= 300):
      return "Very Unhealthy";
    case (aqi > 300):
      return "Hazardous"
  }
}