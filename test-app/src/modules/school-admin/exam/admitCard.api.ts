import { baseApi } from "@/src/store/api/baseApi";

import { ApiResponse } from "@/shared-types/response.types";

export type AdmitCardStudent = {
  _id: string;
  className: string;
  fatherName: string;
  parentPhone: string;
  pdfUrl: string | null;
  releasedAt: string | null;
  rollNumber: string | number;
  sectionName: string;
  status: "draft" | "released";
  studentName: string;
};

export const admitCardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmitCardStudents: builder.query<AdmitCardStudent[], string>({
      query: (examId) => `/school-admin/admit-cards/exams/${examId}/students`,
      transformResponse: (res: ApiResponse<AdmitCardStudent[]>) => res.data,
      providesTags: ["AdmitCards"],
    }),

    previewAdmitCard: builder.mutation<
      { pdfUrl: string; previewUrl?: string; studentId: string; studentName: string },
      { examId: string; studentId: string }
    >({
      query: (body) => ({
        url: "/school-admin/admit-cards/preview",
        method: "POST",
        body,
      }),
    }),

    releaseAdmitCards: builder.mutation<
      { count: number; data: AdmitCardStudent[] },
      { examId: string }
    >({
      query: (body) => ({
        url: "/school-admin/admit-cards/release",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdmitCards", "Exams"],
    }),

    getReleasedAdmitCards: builder.query<any[], void>({
      query: () => "/school-admin/admit-cards/released",
      transformResponse: (res: ApiResponse<any[]>) => res.data,
      providesTags: ["AdmitCards"],
    }),
  }),
});

export const {
  useGetAdmitCardStudentsQuery,
  usePreviewAdmitCardMutation,
  useReleaseAdmitCardsMutation,
  useGetReleasedAdmitCardsQuery,
} = admitCardApi;
