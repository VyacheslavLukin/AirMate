import axios from 'axios';

const URL = process.env.REACT_APP_API_URL;

export const getStationInfoById = (id) => {
    // id = id.replace('/','%2F');
    return axios.get(`${URL}/get_station_data/${id}`);
}

export const getStationsList = () => {
    return axios.get(`${URL}/get_stations_list`);
}

export const getMeasurementsFromAllStations = (parameter) =>{
    return axios.get(`${URL}/stations/${parameter}`);
}

export const getParametersList = () => {
    return axios.get(`${URL}/get_parameters_list`);
}