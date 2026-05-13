import { baseApi } from "@/src/store/api/baseApi";

export type AcademicYear = {
  _id: string;
  isActive: boolean;
  name: string;
};

type ApiEnvelope<T> = {
  data: T;
  message?: string;
  success?: boolean;
};

type CreateAcademicYearPayload = {
  name: string;
};

export const academicYearApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicYears: builder.query<AcademicYear[], void>({
      query: () => "/school-admin/academic-years",
      transformResponse: (response: ApiEnvelope<AcademicYear[]>) => response.data ?? [],
      providesTags: ["AcademicYears"],
    }),

    createAcademicYear: builder.mutation<AcademicYear, CreateAcademicYearPayload>({
      query: (body) => ({
        url: "/school-admin/academic-years",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<AcademicYear>) => response.data,
      invalidatesTags: ["AcademicYears"],
    }),

    setActiveYear: builder.mutation<AcademicYear, string>({
      query: (id) => ({
        url: `/school-admin/academic-years/set-active/${id}`,
        method: "PATCH",
      }),
      transformResponse: (response: ApiEnvelope<AcademicYear>) => response.data,
      invalidatesTags: ["AcademicYears", "Dashboard", "Exams", "Schedule"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAcademicYearMutation,
  useGetAcademicYearsQuery,
  useLazyGetAcademicYearsQuery,
  useSetActiveYearMutation,
} = academicYearApi;
