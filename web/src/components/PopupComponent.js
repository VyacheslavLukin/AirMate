import '../App.css';

import PersonalChart from './PersonalChart';
import {getColorBasedOnAQI} from '../common/Utils';


export const getStationPopupContent = (stationInfo) => {
    let measurements = []
    if (stationInfo.measurements){
      stationInfo.measurements.forEach(measurement => {
        measurements.push(<div key={measurement.parameter}> {measurement.parameter}: {measurement.value} {measurement.unit} </div>); 
      });
    }
    let aqi = stationInfo.aqi ? stationInfo.aqi : {
      value: 34.58,
      text: 'Good'
    }
    let popupContent = 
        <div 
        className='popup-container'
        >
              <h3>{stationInfo.city}, {stationInfo.country} | {stationInfo.id}</h3>
              <hr style={{marginBottom: 4, marginTop: 4 }} />
             
              <div style={{display: "flex", flexDirection: "column"}} className="aqi-scale"> 
                General
                {getAirQuilityDescription(aqi)} 
              </div> 
              <div className="aqi-scale"> 
                {stationInfo.parameter}
                {getAirQuilityDescription(stationInfo.param_aqi)} 
              </div> 
              <br/>
              <hr/>
              {measurements}
             
        </div>
    return popupContent;
  }


export const getHistoryPopup = (id, parameters, selectedParameter) => {
  return (<PersonalChart stationId={id} parameters={parameters} selectedParameter={selectedParameter}/>);
}

const getAirQuilityDescription = (aqi) => {
  let value = Math.round( aqi.value * 10 ) / 10;
  let text = aqi.text;
  let color = getColorBasedOnAQI(aqi);
  // if (value >= 0 && value <= 50){
  //   color = colors[0]
  // } else if (value > 50 && value <= 100) {
  //   color = colors[1]
  // } else if (value > 100 && value <= 150) {
  //   color = colors[2]
  // } else if (value > 150 && value <= 200){
  //   color = colors[3]
  // } else if (value > 200 && value <= 300){
  //   color = colors[4]
  // } else if (value > 300){
  //   color = colors[5]
  // } else {
  //   color = colors[0]
  // }
  return <div> <div style={{marginBottom: 10}}> Air Quility Index: <span style={{backgroundColor:color}}>{value}</span> <br/> </div>
  <span style={{backgroundColor: color, color: "white", paddingLeft: 5, paddingRight: 5}}>{text}</span>
</div>;
}