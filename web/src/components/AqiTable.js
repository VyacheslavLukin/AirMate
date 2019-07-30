import React from 'react';
import style from '../App.css';

export default function AqiTable() {
    const colors = ['#52B947', '#F3EC19', '#F57E1F', '#ED1C24', '#7F2B7E', '#480D27']
    return (
        <div key="aqi" 
        className="aqi-table"
        >
             <table >
                <thead>
                    <tr>
                    <th>AQI</th>
                    <th></th>
                    </tr>
                </thead>
                <tbody >
                    <tr style={{backgroundColor: colors[0]}}>
                        <td>0-50</td>
                        <td>Good</td>
                    </tr>
                    <tr style={{backgroundColor: colors[1]}}>
                        <td>51-100</td>
                        <td>Moderate</td>
                    </tr>
                    <tr style={{backgroundColor: colors[2]}}>
                        <td>101-150</td>
                        <td>Unhealthy for Sensitive Groups</td>
                    </tr>
                    <tr style={{backgroundColor: colors[3]}}>
                        <td>151-200</td>
                        <td>Unhealthy</td>
                    </tr>
                    <tr style={{backgroundColor: colors[4]}}>
                        <td>201-300</td>
                        <td>Very Unhealthy</td>
                    </tr>
                    <tr style={{backgroundColor: colors[5], color:'white'}}>
                        <td>300+</td>
                        <td>Hazardous</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
