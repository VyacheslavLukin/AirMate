import React from 'react';
import Chart from 'chart.js';

import { getStationAQI, getStationHistory, getStationInfoById } from '../common/Api';
import { Dropdown, DropdownButton } from 'react-bootstrap';


// import DropdownButton from 'react-bootstrap/DropdownButton'
// import Dropdown from 'react-bootstrap/Dropdown'

const colors = ['#52B947AA', '#F3EC19AA', '#F57E1FAA', '#ED1C24AA', '#7F2B7EAA', '#480D27AA'];


export default class PersonalChart extends React.Component {
  
  chartRef = React.createRef();
  
  // props.stationId is required
  constructor(props) {
    super(props);
    this.state = {
      stationId: props.stationId
    }
    console.log('props', props);
    getStationInfoById(props.stationId).then(resp => {
      console.log("resp", resp);
      let parameters = resp.data.measurements.map(measurement => {
        return measurement.parameter
      })
        this.setState({
          parameters: parameters,
        });
        
    });
    

    
    
    if (props.selectedParameter) {
      console.log('!!props.selectedParameter');
      this.state = { ...this.state, selectedParameter: props.selectedParameter };
    }
    
    this.updateChart = this.updateChart.bind(this);
    console.log('constructor');
  }
  
  updateChart = () => {
    const myChartRef = this.chartRef.current.getContext('2d');
    // let chartCanvas = this.refs.chart;
    
    // console.log("chartCanvas", chartCanvas);
    let history = [];
    let chartData = [];
    let selectedParameter = this.state.selectedParameter || '';
    console.log('selectedParameter', selectedParameter);
    getStationHistory(this.state.stationId).then(result => {
        result.data.forEach(str => {
          history.push(JSON.parse(str));
        });
        
        history.forEach(el => {
          if (el.measurements) {
            el.measurements.forEach(measurement => {
              if (selectedParameter === '' && !!measurement.parameter) {
                selectedParameter = measurement.parameter;
              }
              if (measurement.parameter === selectedParameter) {
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
          console.log('AQI', resp.data[0].aqi);
          this.setState({ aqi: resp.data[0].aqi });

          // select color for chart
          let color = this.getColorBasedByAQI(resp.data[0].aqi.value);
          console.log('CHART COLOR', color);
          
          console.log('ChartData', chartData);
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
        });
        
        
        this.setState({
          chartData,
          selectedParameter: selectedParameter,
        });
        
        
        
      },
    );
  };

  opacity(hexColor){
    console.log('#1A' + hexColor.slice(1));
    return '#1A' + hexColor.slice(1);
  }
  
  getColorBasedByAQI (aqiValue) {
    let color;
    if (aqiValue >= 0 && aqiValue <= 50) {
      color = colors[0];
    } else if (aqiValue > 50 && aqiValue <= 100) {
      color = colors[1];
    } else if (aqiValue > 100 && aqiValue <= 150) {
      color = colors[2];
    } else if (aqiValue > 150 && aqiValue <= 200) {
      color = colors[3];
    } else if (aqiValue > 200 && aqiValue <= 300) {
      color = colors[4];
    } else if (aqiValue > 300) {
      color = colors[5];
    } else {
      color = colors[0];
    }
    console.log("COLOR", color);
    return color
  }
  
  componentDidMount() {
    console.log('componentDidMount');
    this.updateChart();
  }
  
  select(newParameter) {
    // console.log('SELECT NEW PARAM');
    if (this.chartRef.current) {
      // console.log('new param', newParameter);
      this.setState({ selectedParameter: newParameter }, () => this.updateChart());
      // console.log('current param', this.state.selectedParameter);
      ;
    }
    
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
          title={this.state.selectedParameter}
        >
          {this.state.parameters ? this.state.parameters.map(variant => (
            <Dropdown.Item
              active={variant === this.state.selectedParameter}
              onClick={() => this.select(variant)}
              // variant={variant.toLowerCase}
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

// export default PersonalChart;