import axios from 'axios';

export const getStationInfoById = (id) => {
    return axios.get(`${process.env.REACT_APP_API_URL}/get_station_data/${id}`);
}

export const getStationsList = () => {
    return axios.get(`${process.env.REACT_APP_API_URL}/get_stations_list`)
}