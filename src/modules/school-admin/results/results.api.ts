import { baseApi } from "@/src/store/api/baseApi";

type ResultCreateRow = {
  examId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  sectionId?: string;
  marksObtained: number;
  totalMarks: number;
};

type ResultHistoryItem = {
  _id: string;
  marksObtained: number;
  totalMarks: number;
  createdAt: string;
  studentId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    rollNumber?: number | string;
  };
  subjectId?: {
    _id?: string;
    name?: string;
  };
  examId?: {
    _id?: string;
    name?: string;
    examType?: string;
  };
};

type ResultHistoryResponse = {
  success: boolean;
  data: ResultHistoryItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const resultsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    saveResults: builder.mutation<
      { success: boolean; message?: string },
      { results: ResultCreateRow[] }
    >({
      query: (body) => ({
        url: "/result/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Results"],
    }),
    getResultsHistory: builder.query<
      ResultHistoryResponse,
      {
        classId?: string;
        sectionId?: string;
        subjectId?: string;
        studentId?: string;
        examId?: string;
        search?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/result/history",
        params,
      }),
      transformResponse: (res: any) => ({
        success: Boolean(res?.success),
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta,
      }),
      providesTags: ["Results"],
    }),
  }),
});

export const { useSaveResultsMutation, useGetResultsHistoryQuery } = resultsApi;
