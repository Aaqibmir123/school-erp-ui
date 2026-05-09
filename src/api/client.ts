import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

import { APP_ENV } from "../config/env";

export const apiClient = axios.create({
  baseURL: APP_ENV.API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers.Accept = "application/json";
  config.headers["Content-Type"] = "application/json";
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export interface ApiEnvelope<T> {
  data: T;
  message?: string;
  success: boolean;
}

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const code = String(error.code || "").toUpperCase();
    const message = String(error.message || "").toLowerCase();

    if (
      code === "ERR_NETWORK" ||
      message.includes("network error")
    ) {
      return "Please check your internet connection";
    }

    if (code === "ECONNABORTED" || message.includes("timeout")) {
      return "Server busy";
    }

    if (status === 429) {
      return "Too many attempts, try later";
    }

    if (status && status >= 500) {
      return "Server busy";
    }

    if (!error.response) {
      return "Server busy";
    }

    const responseData = error.response?.data as
      | { message?: unknown; error?: unknown; detail?: unknown }
      | string
      | undefined;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData.trim();
    }

    if (responseData && typeof responseData === "object") {
      const candidate =
        responseData.message ?? responseData.error ?? responseData.detail;

      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};

const unwrapEnvelope = <T>(payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;

    if (!envelope.success) {
      throw new Error(envelope.message || fallback);
    }

    return envelope.data;
  }

  return payload as T;
};

export const postJson = async <T>(
  path: string,
  body?: unknown,
  fallback = "Something went wrong",
) => {
  try {
    const connection = await NetInfo.fetch();
    if (!connection.isConnected || connection.isInternetReachable === false) {
      throw new Error("Please check your internet connection");
    }

    const response = await apiClient.post(path, body);

    return unwrapEnvelope<T>(response.data, fallback);
  } catch (error) {
    throw new Error(extractErrorMessage(error, fallback));
  }
};
