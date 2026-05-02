import { baseApi } from "@/src/store/api/baseApi";

type ApiEnvelope<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

export type SchoolProfile = {
  address?: string;
  checkInCloseTime?: string;
  checkInOpenTime?: string;
  checkOutCloseTime?: string;
  logo?: string;
  name?: string;
  schoolName?: string;
  schoolEndTime?: string;
  schoolStartTime?: string;
  seal?: string;
  signature?: string;
  lateMarkAfterTime?: string;
  workingDays?: string[];
};

export const schoolApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSchool: builder.query<SchoolProfile | null, void>({
      query: () => "/school",
      transformResponse: (response: ApiEnvelope<SchoolProfile | null>) =>
        response.data ?? null,
      providesTags: ["Dashboard"],
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      keepUnusedDataFor: 300,
    }),

    createSchool: builder.mutation<SchoolProfile, FormData>({
      query: (body) => ({
        url: "/school",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<SchoolProfile>) => response.data,
      invalidatesTags: ["Dashboard", "Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateSchoolMutation, useGetSchoolQuery } = schoolApi;
