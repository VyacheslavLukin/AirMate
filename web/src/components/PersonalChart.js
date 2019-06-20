import React from 'react';
import { getStationAQI, getStationHistory } from '../common/Api';

class PersonalChart extends React.Component {
  // props.stationId is required
  constructor(props) {
    super(props);

    let history;
    getStationHistory(props.stationId).forEach(str =>
      history.join(JSON.parse(str)),
    );
    const { aqi } = getStationAQI(props.stationId);
    const paramSet = new Set();
    let currentParam = '';
    const chartData = [];
    history.forEach(el => {
      if (el.measurements) {
        el.measurements.forEach(measurement => {
          paramSet.add(measurement.parameter);
          if (currentParam === '') {
            currentParam = measurement.parameter;
          }
          if (measurement.parameter === currentParam) {
            chartData.join({
              x: measurement.lastUpdated,
              y: measurement.value,
            });
          }
        });
      }
    });

    const ctx = document.getElementById('personal-chart').getContext('2d');
    const personalChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        elements: {
          line: {
            cubicInterpolationMode: 'monotone',
          },
        },
      },
    });

    this.setState({
      history,
      paramSet,
      currentParam,
      chartData,
      ctx,
      aqi,
    });
  }

  changeParameter() {
    // change current parameter and redraw a chart
  }

  render() {
    return (
      <div>
        <DropdownButton
          id="dropdown-basic-button"
          title={this.state.currentParam}
        >
          {this.state.paramSet.map(variant => (
            <Dropdown.Item href="#/action-1">{variant}</Dropdown.Item>
          ))}
        </DropdownButton>
        <canvas id="personal-chart" width="400" height="400" />
        <span>
          AQI = {this.state.aqi.value} and it is {this.state.aqi.text}
        </span>
      </div>
    );
  }
}
