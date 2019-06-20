import axios from 'axios';

const URL = process.env.REACT_APP_API_URL;

export const getStationInfoById = id => {
  // id = id.replace('/','%2F');
  return axios.get(`${URL}/get_station_data/${id}`);
};

export const getStationsList = () => {
  return axios.get(`${URL}/get_stations_list`);
};

export const getMeasurementsFromAllStations = parameter => {
  return axios.get(`${URL}/stations/${parameter}`);
};

export const getParametersList = () => {
  return axios.get(`${URL}/get_params_list`);
};

export const getNearestStationData = (latitude, longitude) => {
  return axios.get(`${URL}/get_nearest_station_data/${latitude}/${longitude}`);
};

export const getStationHistory = stationId => {
    
  return axios.get(`${URL}/get_station_history/${stationId}`);
};

export const getDataByDate = date => {
  return axios.get(`${URL}/get_data_by_date/${date}`);
};

export const getStationAQI = stationId => {
  return axios.get(`${URL}/get_station_aqi/${stationId}`);
};