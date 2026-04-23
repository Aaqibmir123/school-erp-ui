import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { APP_ENV } from "../config/env";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const baseQuery = fetchBaseQuery({
  baseUrl: APP_ENV.API_URL,
  prepareHeaders: (headers) => {
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

    return headers;
  },
});

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
    "Results",
    "Students",
    "Subjects",
    "Teachers",
    "Timetable",
  ],
  endpoints: () => ({}),
});
