import React from 'react';
import Chart from 'chart.js';

import { getStationAQI, getStationHistory, getParametersList } from '../common/Api';

import style from '../App.css';


// import DropdownButton from 'react-bootstrap/DropdownButton'
// import Dropdown from 'react-bootstrap/Dropdown'

import {Dropdown, DropdownButton} from 'react-bootstrap'


export default class PersonalChart extends React.Component {

  chartRef = React.createRef();
  
  // props.stationId is required
  constructor(props) {
    super(props);

    console.log('props.parameters', props.parameters);
    this.state = {
      stationId: props.stationId,
      parameters: props.parameters
    };

    this.updateChart = this.updateChart.bind(this);
    console.log("constructor");
  }

  updateChart = () => {
    const myChartRef = this.chartRef.current.getContext("2d");
    // let chartCanvas = this.refs.chart;
    
    // console.log("chartCanvas", chartCanvas);
    let history = [];
    let chartData = [];
    let currentParam = '';
    getStationHistory(this.state.stationId).then(result => {
      result.data.forEach(str => {
          history.push(JSON.parse(str));
      });
      
      history.forEach(el => {
        if (el.measurements) {
          el.measurements.forEach(measurement => {
            if (currentParam === '' && !!measurement.parameter) {
              currentParam = measurement.parameter;
            }
            if (measurement.parameter === currentParam) {
              // chartData.push(measurement.value);
              chartData.push({
                x: measurement.lastUpdated,
                y: measurement.value,
              });
            }
          });
        }
      });
      getStationAQI(this.props.stationId).then(resp => {
        console.log("AQI", resp.data[0].aqi); 
        this.setState({aqi: resp.data[0].aqi});
      });
  
      
      this.setState({
        chartData,
        currentParam
      });

      console.log('ChartData', chartData);
      let myChart = new Chart(myChartRef, {
        type: 'line',
        data: {
          datasets: [{
            // label: "Test",
            data: chartData
          }]
        },
        options: {
          scales: {
              yAxes: [{
                  stacked: true
              }]
          }
      }
      });

      this.setState({
        chart: myChart
      });
      
    }
    );
  }

  componentDidMount () {
    console.log("componentDidMount");
    this.updateChart(); 
  }


  // componentDidUpdate () {

  //   const data = this.state.chartData
  //   let chart = this.state.chart;
  //   console.log("componentDidUpdate this.state.chartData", this.state.chartData);
  //   if (data && chart)  {
  
  //     // data.forEach((dataset, i) => chart.data.datasets[i].data = dataset.data);
  //     // data.forEach((y, i) => chart.data.datasets[i].data = y);
  //     chart.data.datasets[0].data = data
  //     // chart.data.labels = data.labels;
  //     chart.update();
  //   }
      
  // };

  render() {
    return (
      // className={style['card']}
      <div 
      // className={style['detailed-popup']}
      className='detailed-popup'
      >
        {/* <DropdownButton id="dropdown-basic-button" title="Dropdown button">
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </DropdownButton> */}
        <DropdownButton
          key="dropdown-basic-button"
          id="dropdown-basic-button"
          title={this.state.currentParam}
        >
          {/* {getParametersList().then(resp => 
            resp.data
            .map(variant => (
              <Dropdown.Item href="#/action-1" 
                variant={variant.toLowerCase}
                id={`dropdown-item-${variant}`}
                key='variant'>{variant}</Dropdown.Item>
          )))} */}
            {this.state.parameters.map(variant => (
              <Dropdown.Item href="#/action-1" 
                // variant={variant.toLowerCase}
                id={`dropdown-item-${variant}`}
                key={variant}>{variant}</Dropdown.Item>
          ))}
        </DropdownButton>
        {/* <canvas id="personal-chart" width="400" height="400" /> */}
        {/* <LineChart data={this.state.chartData} width='400' height='400'></LineChart> */}
        {/* {this.state.chartData ?  */}
        <canvas
        ref={this.chartRef}
        height={'400'} width={'400'}></canvas> 

        {this.state.aqi ? <span >
          AQI = {this.state.aqi.value.toFixed(1)} and it is {this.state.aqi.text}
        </span> : null }
        
      </div>
    );
  }
}

// export default PersonalChart;