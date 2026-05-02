import { baseApi } from "@/src/store/api/baseApi";

export type MarksCardPreviewResponse = {
  exam: {
    _id: string;
    date?: string;
    examType: string;
    marksCardApprovedAt?: string | null;
    marksCardApprovedBy?: string | null;
    marksCardStatus?: "draft" | "approved";
    pdfUrl?: string;
    previewUrl?: string;
    name: string;
    totalMarks: number;
  };
  school: {
    address?: string;
    logo?: string;
    name: string;
    seal?: string;
    signature?: string;
  };
  students?: Array<{
    _id: string;
    className: string;
    fatherName?: string;
    grade: string;
    name: string;
    obtained: number;
    percentage: number;
    photo?: string;
    rollNumber: number | string;
    sectionName: string;
    total: number;
  }>;
  student: {
    _id?: string;
    className: string;
    fatherName?: string;
    name: string;
    photo?: string;
    rollNumber: number | string;
    sectionName: string;
  };
  summary: {
    grade: string;
    obtained: number;
    percentage: number;
    remarks: string;
    total: number;
  };
  subjects: Array<{
    grade: string;
    max: number;
    obtained: number;
    name: string;
  }>;
};

export const marksCardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMidTermMarksCardPreview: builder.query<
      { success: boolean; data: MarksCardPreviewResponse },
      { studentId?: string } | void
    >({
      query: (params) => ({
        url: "/result/marks-card",
        params,
      }),
      transformResponse: (res: any) => ({
        success: Boolean(res?.success),
        data: (res?.data || {}) as MarksCardPreviewResponse,
      }),
      providesTags: ["Results"],
    }),

    toggleMarksCardApproval: builder.mutation<
      { success: boolean; data: any; message: string },
      { examId: string; approved: boolean }
    >({
      query: ({ examId, approved }) => ({
        url: `/school-admin/exams/${examId}/marks-card-approval`,
        method: "PATCH",
        body: { approved },
      }),
      invalidatesTags: ["Results", "Exams"],
    }),
  }),
});

export const { useGetMidTermMarksCardPreviewQuery, useToggleMarksCardApprovalMutation } = marksCardsApi;
