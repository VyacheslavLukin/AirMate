import React from 'react';
import Chart from 'chart.js';

import { getStationHistory, getStationInfoById } from '../common/Api';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import {getColorBasedOnAQI} from '../common/Utils';


export default class PersonalChart extends React.Component {
  
  chartRef = React.createRef();
  
  // props.stationId is required
  constructor(props) {
    super(props);
    this.state = {
      stationId: props.stationId
    }
    getStationInfoById(props.stationId).then(resp => {
      console.log("resp", resp);
      let parameters = resp.data.measurements.map(measurement => {
        return measurement.parameter
      })
        this.setState({
          parameters: parameters
        });
    });
    
    if (props.selectedParameter) {
      this.state = { ...this.state, selectedParameter: props.selectedParameter };
    }
    
    this.updateChart = this.updateChart.bind(this);
  }
  
  updateChart = () => {
    const myChartRef = this.chartRef.current.getContext('2d');
    let history = [];
    let chartData = [];
    let selectedParameter = this.state.selectedParameter || '';
    getStationHistory(this.state.stationId).then(result => {
        result.data.forEach(str => {
          history.push(str);
        });
        
        history.forEach(el => {
          if (el.measurements) {
            el.measurements.forEach(measurement => {
              if (selectedParameter === '' && !!measurement.parameter) {
                selectedParameter = measurement.parameter;
              }
              if (measurement.parameter === selectedParameter) {
                chartData.push({
                  x: measurement.lastUpdated,
                  y: measurement.value,
                });
              }
            });
          }
        });
        
        this.setState({ aqi: result.data[0].aqi });

        // select color for chart
        let color = getColorBasedOnAQI(result.data[0].aqi.value);
        
        let myChart = new Chart(myChartRef, {
          type: 'line',
          data: {
            datasets: [{
              cubicInterpolationMode: 'monotone',
              borderColor: color,
              backgroundColor: color,
              label: selectedParameter,
              data: chartData,
            }],
          },
          options: {
            scales: {
              yAxes: [{
                stacked: true,
              }],
            },
          },
        });
          
        this.setState({
          chart: myChart,
        });   
        
        this.setState({
          chartData,
          selectedParameter: selectedParameter,
        });    
      },
    );
  };

  opacity(hexColor){
    return '#1A' + hexColor.slice(1);
  }
  
  componentDidMount() {
    this.updateChart();
  }
  
  select(newParameter) {
    if (this.chartRef.current) {
      this.setState({ selectedParameter: newParameter }, () => this.updateChart());
      ;
    }
    
  }
  
  render() {
    return (
      <div
        className='detailed-popup'
      >
        <DropdownButton
          key="dropdown-basic-button"
          id="dropdown-basic-button"
          title={this.state.selectedParameter}
        >
          {this.state.parameters ? this.state.parameters.map(variant => (
            <Dropdown.Item
              active={variant === this.state.selectedParameter}
              onClick={() => this.select(variant)}
              id={`dropdown-item-${variant}`}
              key={variant}>{variant}</Dropdown.Item>
          )) : null}
        </DropdownButton>
        <canvas
          key="canvas"
          ref={this.chartRef}
          height={'400'} width={'400'}/>
        
        {this.state.aqi ? <span>
          AQI = {this.state.aqi.value.toFixed(1)} and it is {this.state.aqi.text}
        </span> : null}
      
      </div>
    );
  }
}