import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { APP_ENV } from "../config/env";
import { storage } from "../utils/secureStorage";

let authToken: string | null = null;
let sessionRefreshToken: string | null = null;
let authExpiredHandler: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setAuthSession = (
  token: string | null,
  refreshToken: string | null = null,
) => {
  authToken = token;
  sessionRefreshToken = refreshToken;
};

export const setRefreshToken = (token: string | null) => {
  sessionRefreshToken = token;
};

export const setAuthExpiredHandler = (handler: (() => void) | null) => {
  authExpiredHandler = handler;
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: APP_ENV.API_URL,
  prepareHeaders: (headers) => {
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    return headers;
  },
});

const getStoredRefreshToken = async () => {
  if (sessionRefreshToken) {
    return sessionRefreshToken;
  }

  try {
    const stored = await storage.getItem("refreshToken");
    sessionRefreshToken = stored || null;
    return sessionRefreshToken;
  } catch {
    return null;
  }
};

const baseQuery = async (args: any, api: any, extraOptions: any) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (
    result?.error &&
    "status" in result.error &&
    result.error.status === 401
  ) {
    const url = typeof args === "string" ? args : args?.url || "";
    const isAuthRoute = String(url).includes("/auth/");

    if (!isAuthRoute) {
      const refreshToken = await getStoredRefreshToken();

      if (refreshToken) {
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken },
          },
          api,
          extraOptions,
        );

        const refreshedToken = (refreshResult as any)?.data?.data?.token;
        const refreshedRefreshToken =
          (refreshResult as any)?.data?.data?.refreshToken || refreshToken;

        if (refreshedToken) {
          setAuthSession(refreshedToken, refreshedRefreshToken);

          try {
            await storage.setItem("token", refreshedToken);
            await storage.setItem("refreshToken", refreshedRefreshToken);
          } catch {
            // Best effort only.
          }

          return rawBaseQuery(args, api, extraOptions);
        }
      }

      try {
        await storage.multiRemove([
          "token",
          "user",
          "students",
          "selectedStudent",
          "refreshToken",
        ]);
      } catch {
        // Best effort only.
      }

      setAuthSession(null, null);
      authExpiredHandler?.();
      if (typeof window === "undefined") {
        return result;
      }
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Attendance",
    "Classes",
    "Dashboard",
    "Exam",
    "Fees",
    "Homework",
    "Progress",
    "Notices",
    "Results",
    "Students",
    "Subjects",
    "School",
    "Teachers",
    "Timetable",
    "AdmitCards",
  ],
  endpoints: () => ({}),
});
