import axios from 'axios';
import { logoutUser } from '../utils/auth';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // <-- Molto importante! Cookie HttpOnly
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await instance.post('/refresh-token');
        localStorage.setItem('token', res.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        logoutUser();
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

