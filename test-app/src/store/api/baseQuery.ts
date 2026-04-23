import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { APP_ENV } from "@/src/config/env";

import { startLoading, stopLoading } from "../uiSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: APP_ENV.API_URL,
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const baseQueryWithInterceptor = async (
  args: any,
  api: any,
  extraOptions: any,
) => {
  try {
    api.dispatch(startLoading());

    const result = await rawBaseQuery(args, api, extraOptions);

    api.dispatch(stopLoading());

    return result;
  } catch (error) {
    api.dispatch(stopLoading());
    return { error };
  }
};
