import axios from 'axios';

const URL = process.env.REACT_APP_API_URL;

export const getStationInfoById = id => {
  return axios.get(`${URL}/station/${id}`);
};

export const getStationsList = () => {
  return axios.get(`${URL}/stations`);
};

export const getMeasurementsFromAllStations = parameter => {
  return axios.get(`${URL}/stations/data?aqi=true&parameter=${parameter}`);
};

export const getParametersList = () => {
  return axios.get(`${URL}/stations/parameters`);
};

export const getStationHistory = stationId => {
  return axios.get(`${URL}/station/${stationId}/history?aqi=true`);
};

export const getStationAQI = stationId => {
  return axios.get(`${URL}/station/${stationId}/aqi`);
};