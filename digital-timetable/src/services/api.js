import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Note: base URL ends with /api, not /api/timetable
  withCredentials: true,
});

export default api;
