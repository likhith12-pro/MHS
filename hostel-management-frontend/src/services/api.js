import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to requests if present in localStorage
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore parsing error
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default API;
