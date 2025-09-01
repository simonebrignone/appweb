import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
const API_URL = import.meta.env.BACKEND_API_URL;

export const useAxios = () => {
  const { token, logout, setToken } = useAuth();

  const instance = axios.create({
    baseURL: '${API_URL}/api',
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        config.headers['Authorization'] = `Bearer ${savedToken}`;
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
          const res = await axios.get('${API_URL}/api/auth/refresh-token', { withCredentials: true });
          const newAccessToken = res.data.accessToken;

          localStorage.setItem('token', newAccessToken);
          setToken(newAccessToken);

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return instance(originalRequest);
        } catch (err) {
          logout(true);
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

