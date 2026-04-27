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

export const baseQueryWithInterceptor = async (
  args: any,
  api: any,
  extraOptions: any,
) => {
  try {
    api.dispatch(startLoading());

    const result = await rawBaseQuery(args, api, extraOptions);

    if (
      result?.error &&
      "status" in result.error &&
      result.error.status === 401 &&
      !isAuthRoute(args)
    ) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
      );

      const refreshedToken = (refreshResult as any)?.data?.data?.token;

      if (refreshedToken && typeof window !== "undefined") {
        localStorage.setItem("token", refreshedToken);

        const retry = await rawBaseQuery(args, api, extraOptions);
        api.dispatch(stopLoading());
        return retry;
      }

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        localStorage.removeItem("token");
        window.location.assign("/");
      }
    }

    api.dispatch(stopLoading());

    return result;
  } catch (error) {
    api.dispatch(stopLoading());
    return { error };
  }
};
