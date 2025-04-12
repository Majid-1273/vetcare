// src/services/auth.js
import axios from 'axios';
import { store } from '../redux/store';
import { logoutUser } from '../redux/slices/authSlice';

// Configure axios with auth header
export const setupAxiosInterceptors = () => {
  axios.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        // Add the Bearer prefix
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Handle 401 responses
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Dispatch logout action to Redux
        store.dispatch(logoutUser());
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// These functions now use Redux state instead of directly accessing localStorage
export const isAuthenticated = () => {
  return store.getState().auth.isAuthenticated;
};

export const getCurrentUser = () => {
  return store.getState().auth.user;
};

// For debugging - add a function to check the token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};