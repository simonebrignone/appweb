import axios from 'axios';
import { showSessionExpired, getToken } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const instance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});


instance.interceptors.request.use(
  (config) => {
    const token = getToken();
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
        const res = await instance.get('/auth/refresh-token');
        localStorage.setItem('token', res.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        showSessionExpired();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
