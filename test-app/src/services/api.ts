import axios from "axios";

import { APP_ENV } from "../config/env";
import {
  clearBrowserSession,
  syncBrowserSession,
} from "../modules/auth/utils/session";

const api = axios.create({
  baseURL: APP_ENV.API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: APP_ENV.API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const url = originalRequest?.url || "";

    const isAuthRoute = url.includes("/auth/");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await refreshClient.post("/auth/refresh");
        const refreshedToken = refreshResponse.data?.data?.token;
        const refreshedRefreshToken =
          refreshResponse.data?.data?.refreshToken || localStorage.getItem("refreshToken");
        const refreshedRole = refreshResponse.data?.data?.user?.role;

        if (refreshedToken) {
          syncBrowserSession({
            token: refreshedToken,
            refreshToken: refreshedRefreshToken,
            role: refreshedRole,
          });
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
          return api(originalRequest);
        }
      } catch {
        clearBrowserSession();

        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          window.location.assign("/");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
