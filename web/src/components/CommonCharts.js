import React from 'react';
import Chart from 'chart.js';

import { getMeasurementsFromAllStations } from '../common/Api';
import { Dropdown, DropdownButton } from 'react-bootstrap';


// import DropdownButton from 'react-bootstrap/DropdownButton'
// import Dropdown from 'react-bootstrap/Dropdown'

const colors = ['#52B947', '#F3EC19', '#F57E1F', '#ED1C24', '#7F2B7E', '#480D27'];


export default class CommonChart extends React.Component {
  
  chartRef = React.createRef();
  
  // props.stationId is required
  constructor(props) {
    super(props);
    
    console.log('props.parameters', props.parameters);
    this.state = {
    //   stationId: props.stationId,
      parameters: props.parameters,
    };
    
    if (!!props.currentParameter) {
      this.state = { ...this.state, currentParameter: props.currentParameter };
    } else {
      this.state = { ...this.state, currentParameter: props.parameters[0] };
    }
    
    this.updateChart = this.updateChart.bind(this);
    console.log('constructor');
  }
  
  updateChart = () => {
    const myChartRef = this.chartRef.current.getContext('2d');
    // let chartCanvas = this.refs.chart;
    
    // console.log("chartCanvas", chartCanvas);
    let chartData = [];
    let currentParameter = this.state.currentParameter || '';
    getMeasurementsFromAllStations(currentParameter).then(result => {
        let maxResult = 0;
        result.data.forEach(el => {
          if (el[currentParameter] && el[currentParameter] > maxResult) {
            maxResult = el[currentParameter];
          }
        });
        
        let currentColor;
        result.data.forEach(el => {
          // chartData.push(measurement.value);
          currentColor = this.getColorBasedByAQI(el.aqi.value);
          if (!chartData[currentColor]) {
              chartData[currentColor] = []
          }
          chartData[currentColor].push({
            x: el.latitude,
            y: el.longitude,
            r: 15
            // r: 5 * el[currentParameter] / maxResult, // Bubble radius in pixel with normalization
          });
        });
        
        this.setState({
          chartData,
          currentParameter: currentParameter,
        });
        
        
        let datasets = [];
        Object.keys(chartData).forEach(set =>{
          datasets.push({
            // cubicInterpolationMode: 'monotone',
            backgroundColor: set.toString(),
            borderColor: set.toString(),
            // label: currentParameter,
            data: chartData[set],
          })
        });
        console.log('datasets', datasets);
        // select color for chart
        console.log('ChartData', chartData);
        let myChart = new Chart(myChartRef, {
          type: 'bubble',
          data: {
            datasets: datasets,
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
        
      },
    );
  };
  
  getColorBasedByAQI(aqiValue) {
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
    return color;
  }
  
  componentDidMount() {
    console.log('componentDidMount');
    this.updateChart();
  }
  
  select(newParameter) {
    this.setState({ currentParameter: newParameter });
    
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
          title={this.state.currentParameter}
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
            <Dropdown.Item
              active={variant === this.state.currentParameter}
              onClick={() => this.select(variant)}
              // variant={variant.toLowerCase}
              id={`dropdown-item-${variant}`}
              key={variant}>{variant}</Dropdown.Item>
          ))}
        </DropdownButton>
        {/* <canvas id="personal-chart" width="400" height="400" /> */}
        {/* <LineChart data={this.state.chartData} width='400' height='400'></LineChart> */}
        {/* {this.state.chartData ?  */}
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