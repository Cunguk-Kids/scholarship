import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_HOST,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("[Axios Error]", err.response?.data || err.message);
    return Promise.reject(err);
  }
);
