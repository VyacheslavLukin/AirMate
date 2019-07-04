import style from './Popup.css';
import '../App.css';

import PersonalChart from './PersonalChart';

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
        // className={style['popup-container']}
        className='popup-container'
        >
              <h3>{stationInfo.city}, {stationInfo.country} | {stationInfo.id}</h3>
              <hr/>
              {/* {stationInfo.aqi ? (
                <div> 
                  <p>Air Quility Index: {stationInfo.aqi}</p>
                  <p>{getAirQuilityDescription(aqi)}</p>
                </div>
              ) */}
              {/* : */}
             
              <div className="aqi-scale"> 
                General
                {getAirQuilityDescription(aqi)} 
              </div> 
              <div className="aqi-scale"> 
                {stationInfo.parameter}
                {getAirQuilityDescription(stationInfo.param_aqi)} 
              </div> 
              
              {/* } */} 
              <br/>
              {/* Updated: <span style={{backgroundColor: 'red', opacity: 0.6}}> who knows when </span> */}
              <hr/>
              {measurements}
             
        </div>
    return popupContent;
  }


export const getHistoryPopup = (id, parameters, selectedParameter) => {
  return (<PersonalChart stationId={id} parameters={parameters} selectedParameter={selectedParameter}/>);
  // return (<CommonCharts stationId={id} parameters={parameters} selectedParameter={selectedParameter}/>);
}

const colors = ['#52B947', '#F3EC19', '#F57E1F', '#ED1C24', '#7F2B7E', '#480D27']

const getAirQuilityDescription = (aqi) => {
  let value = Math.round( aqi.value * 10 ) / 10;
  let text = aqi.text;
  let color;
  if (value >= 0 && value <= 50){
    color = colors[0]
  } else if (value > 50 && value <= 100) {
    color = colors[1]
  } else if (value > 100 && value <= 150) {
    color = colors[2]
  } else if (value > 150 && value <= 200){
    color = colors[3]
  } else if (value > 200 && value <= 300){
    color = colors[4]
  } else if (value > 300){
    color = colors[5]
  } else {
    color = colors[0]
  }
  return <div > Air Quility Index: <span style={{backgroundColor:color}}>{value}</span> <br/>
  <span style={{backgroundColor:color}}>{text}</span>
</div>;
}