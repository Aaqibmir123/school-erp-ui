import { baseApi } from "@/src/store/api/baseApi";

import { ICreateExam, IExam } from "@/shared-types/exam.types";
import { ApiResponse } from "@/shared-types/response.types";
import {
  ICreateSchedule,
  ISchedule,
} from "@/shared-types/schedule.types";
import { ITeacher } from "@/shared-types/teacher.types";

export const examApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= EXAMS ================= */

    getExams: builder.query<IExam[], void>({
      query: () => "/school-admin",
      transformResponse: (res: ApiResponse<IExam[]>) => res.data,
      providesTags: ["Exams"],
    }),

    createExam: builder.mutation<void, ICreateExam>({
      query: (body) => ({
        url: "/school-admin/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Exams"],
    }),

    updateExam: builder.mutation<void, { id: string; data: ICreateExam }>({
      query: ({ id, data }) => ({
        url: `/school-admin/exams/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Exams"],
    }),

    deleteExam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/exams/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Exams"],
    }),

    /* ================= SCHEDULE ================= */

    getSchedules: builder.query<ISchedule[], string>({
      query: (examId) => `/school-admin/schedule/${examId}`,
      transformResponse: (res: ApiResponse<ISchedule[]>) => res.data,
      providesTags: ["Schedule"],
    }),

    createSchedule: builder.mutation<void, ICreateSchedule>({
      query: (body) => ({
        url: "/school-admin/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Schedule"],
    }),

    updateSchedule: builder.mutation<
      void,
      { id: string; data: Partial<ICreateSchedule> }
    >({
      query: ({ id, data }) => ({
        url: `/school-admin/schedule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Schedule"],
    }),

    deleteSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/schedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedule"],
    }),

    /* ================= CLASSES ================= */

    getClassesWithSubjects: builder.query<any[], void>({
      query: () => "/school-admin/schedule/classes/subjects",
      transformResponse: (res: ApiResponse<any[]>) => res.data,
    }),

    /* ================= PUBLISH ================= */

    publishExam: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/schedule/publish/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["Exams"],
    }),

    /* ================= TEACHERS ================= */

    getTeachersBySubject: builder.query<
      ITeacher[],
      { subjectId: string; classId: string }
    >({
      query: ({ subjectId, classId }) => ({
        url: "/school-admin/schedule/by-subject",
        params: { subjectId, classId },
      }),
      transformResponse: (res: ApiResponse<ITeacher[]>) => res.data,
    }),
    /* ================= PREVIEW ================= */

    previewSchedule: builder.mutation<
      any[],
      {
        classId: string;
        subjectId: string;
        date: string;
        startTime: string;
        endTime: string;
      }
    >({
      query: (body) => ({
        url: "/school-admin/schedule/preview",
        method: "POST",
        body,
      }),
    }),

    suggestTimeSlots: builder.mutation<
      any[],
      { classId: string; subjectId: string; date: string }
    >({
      query: (body) => ({
        url: "/school-admin/schedule/suggest-time",
        method: "POST",
        body,
      }),
    }),
  }),
});

/* ================= HOOKS ================= */

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,

  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,

  useGetClassesWithSubjectsQuery,
  usePublishExamMutation,
  useGetTeachersBySubjectQuery,
  usePreviewScheduleMutation,
  useSuggestTimeSlotsMutation,
} = examApi;

