import axios from "axios";

import { APP_ENV } from "../config/env";

const api = axios.create({
  baseURL: APP_ENV.API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
