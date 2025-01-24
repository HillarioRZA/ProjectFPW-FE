import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch(logout());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return Promise.reject(error);
    }
  );
}; 