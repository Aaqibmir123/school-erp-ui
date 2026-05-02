import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { APP_ENV } from "@/src/config/env";

import { startLoading, stopLoading } from "../uiSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: APP_ENV.API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

const isAuthRoute = (args: any) => {
  const url = typeof args === "string" ? args : args?.url || "";
  return String(url).includes("/auth/");
};

const getRequestMethod = (args: any) => {
  if (typeof args === "string") return "GET";
  return String(args?.method || "GET").toUpperCase();
};

export const baseQueryWithInterceptor = async (
  args: any,
  api: any,
  extraOptions: any,
) => {
  const method = getRequestMethod(args);
  const shouldToggleGlobalLoading =
    !isAuthRoute(args) && ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  try {
    if (shouldToggleGlobalLoading) {
      api.dispatch(startLoading());
    }

    const result = await rawBaseQuery(args, api, extraOptions);

    if (
      result?.error &&
      "status" in result.error &&
      result.error.status === 401 &&
      !isAuthRoute(args)
    ) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body:
            typeof window !== "undefined"
              ? {
                  refreshToken: localStorage.getItem("refreshToken") || undefined,
                }
              : undefined,
        },
        api,
        extraOptions,
      );

      const refreshedToken = (refreshResult as any)?.data?.data?.token;
      const refreshedRefreshToken =
        (refreshResult as any)?.data?.data?.refreshToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("refreshToken")
          : null);

      if (refreshedToken && typeof window !== "undefined") {
        localStorage.setItem("token", refreshedToken);
        if (refreshedRefreshToken) {
          localStorage.setItem("refreshToken", refreshedRefreshToken);
        }

        const retry = await rawBaseQuery(args, api, extraOptions);
        if (shouldToggleGlobalLoading) {
          api.dispatch(stopLoading());
        }
        return retry;
      }

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        localStorage.removeItem("token");
        window.location.assign("/");
      }
    }

    if (shouldToggleGlobalLoading) {
      api.dispatch(stopLoading());
    }

    return result;
  } catch (error) {
    if (shouldToggleGlobalLoading) {
      api.dispatch(stopLoading());
    }
    return { error };
  }
};
