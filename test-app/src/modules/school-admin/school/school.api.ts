import { baseApi } from "@/src/store/api/baseApi";

type ApiEnvelope<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

const unwrapSchoolResponse = (
  response: ApiEnvelope<SchoolProfile | null> | SchoolProfile | null | undefined,
): SchoolProfile | null => {
  if (!response) {
    return null;
  }

  if (typeof response === "object" && "data" in response) {
    return response.data ?? null;
  }

  return response;
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
      transformResponse: (
        response: ApiEnvelope<SchoolProfile | null> | SchoolProfile | null,
      ) => unwrapSchoolResponse(response),
      providesTags: ["Dashboard"],
      keepUnusedDataFor: 300,
    }),

    createSchool: builder.mutation<SchoolProfile, FormData>({
      query: (body) => ({
        url: "/school",
        method: "POST",
        body,
      }),
      transformResponse: (
        response: ApiEnvelope<SchoolProfile> | SchoolProfile | null,
      ) => unwrapSchoolResponse(response) ?? ({} as SchoolProfile),
      invalidatesTags: ["Dashboard", "Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useCreateSchoolMutation, useGetSchoolQuery } = schoolApi;
