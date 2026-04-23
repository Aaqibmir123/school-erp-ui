import { baseApi } from "../baseQuery";

/* ================= API ================= */

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= TIMETABLE ================= */
    getTeacherTimetable: builder.query<any, string>({
      query: (date) => ({
        url: "/teacher/timetable",
        params: { date },
      }),
      transformResponse: (res: any) => res.data,
      providesTags: ["Timetable"],
    }),

    getTimetable: builder.query<any, void>({
      query: () => ({
        url: "/teacher/timetable",
      }),
      providesTags: ["Timetable"],
    }),

    /* ================= CURRENT CLASS ================= */
    getCurrentClass: builder.query<any, void>({
      query: () => ({
        url: "/school-admin/teacher/current-class",
      }),
      transformResponse: (res: any) => res.data,
      providesTags: ["Timetable"],
    }),

    /* ================= STUDENTS ================= */
    getStudentsByClass: builder.query<
      any[],
      { classId: string; sectionId: string }
    >({
      query: ({ classId, sectionId }) => ({
        url: "/teacher/by-class",
        params: { classId, sectionId },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Students"],
    }),

    getMyClasses: builder.query<any[], void>({
      query: () => ({
        url: "/teacher/my-classes",
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Timetable"],
    }),

    /* ================= PROGRESS ================= */
    getStudentProgress: builder.query<any, any>({
      query: (params) => ({
        url: "/teacher/student-progress",
        params,
      }),
      transformResponse: (res: any) => ({
        data: res?.data || [],
        meta: res?.meta || {},
      }),
      providesTags: ["Progress"],
    }),

    /* ================= HOMEWORK ================= */
    getTeacherHomework: builder.query<any, void>({
      query: () => ({
        url: "/homework/teacher",
      }),
      providesTags: ["Homework"],
    }),

    getStudentHomework: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/homework/student",
        params: { page, limit },
      }),
      providesTags: ["Homework"],
    }),

    createHomework: builder.mutation<any, any>({
      query: (body) => ({
        url: "/homework/teacher/homework",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Homework"],
    }),

    updateHomework: builder.mutation<any, { id: string; payload: any }>({
      query: ({ id, payload }) => ({
        url: `/homework/teacher/homework/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Homework"],
    }),

    deleteHomework: builder.mutation<any, string>({
      query: (id) => ({
        url: `/homework/teacher/homework/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Homework"],
    }),

    /* ================= EXAM ================= */

    createExam: builder.mutation<any, any>({
      query: (body) => ({
        url: "/exam",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Exam"],
    }),

    getMyExams: builder.query<any[], void>({
      query: () => ({
        url: "/exam/my",
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Exam"],
    }),

    deleteExam: builder.mutation<any, string>({
      query: (id) => ({
        url: `/exam/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Exam"],
    }),

    updateExam: builder.mutation<any, { id: string; payload: any }>({
      query: ({ id, payload }) => ({
        url: `/exam/${id}`,
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: ["Exam"],
    }),

    /* ================= RESULTS ================= */

    createResult: builder.mutation<any, any>({
      query: (body) => ({
        url: "/result/create",
        method: "POST",
        body,
      }),
    }),

    updateResult: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/results/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Results"],
    }),

    deleteResult: builder.mutation<any, string>({
      query: (id) => ({
        url: `/results/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Results"],
    }),

    getResultsByExam: builder.query<any[], { examId: string }>({
      query: ({ examId }) => ({
        url: `/result`,
        params: { examId },
      }),
      transformResponse: (res: any) => res.data || [],
      providesTags: ["Results"],
    }),

    getMarksheet: builder.query<any, { examId: string; studentId: string }>({
      query: ({ examId, studentId }) => ({
        url: `/result/${examId}/${studentId}`,
      }),
    }),

    getTeacherAcademicExams: builder.query<any[], void>({
      query: () => ({
        url: "/teacher/exams",
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Exam"],
    }),

    saveBulkMarks: builder.mutation<any, any>({
      query: (body) => ({
        url: "/teacher/marks/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Exam"],
    }),

    getMarksByExam: builder.query<
      { studentId: string; marks: number | null }[],
      { examId: string; subjectId: string; classId: string }
    >({
      query: ({ examId, subjectId, classId }) => ({
        url: "/teacher/marks/by-exam",
        params: { examId, subjectId, classId },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Exam"],
    }),

    saveBulkAttendance: builder.mutation<any, any>({
      query: (body) => ({
        url: "/teacher/attendance/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Exam"],
    }),

    getAttendanceByExam: builder.query<
      any[],
      { examId: string; subjectId: string }
    >({
      query: ({ examId, subjectId }) => ({
        url: "/teacher/attendance/by-exam",
        params: { examId, subjectId },
      }),
      transformResponse: (res: any) => res?.data || [],
    }),

    /* ================= HOMEWORK CHECK ================= */

    markHomeworkCheck: builder.mutation<any, any>({
      query: (body) => ({
        url: "/homework/check",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Homework"],
    }),

    getHomeworkCheck: builder.query<any[], string>({
      query: (homeworkId) => ({
        url: `/homework/${homeworkId}`,
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Homework"],
    }),
    markAttendance: builder.mutation<
      { message: string },
      {
        classId: string;
        sectionId?: string | null;
        periodId: string;
        date: string;
        subjectId: string;
        students: {
          studentId: string;
          status: "PRESENT" | "ABSENT";
        }[];
      }
    >({
      query: (body) => ({
        url: "/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getClassAttendance: builder.query<
      any[],
      {
        classId: string;
        sectionId: string;
        subjectId: string;
        periodId: string;
        date: string;
      }
    >({
      query: (params) => ({
        url: "/attendance/class",
        params,
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Attendance"],
    }),
  }),
});

/* ================= EXPORT HOOKS ================= */

export const {
  useGetTeacherTimetableQuery,
  useGetTimetableQuery,
  useGetCurrentClassQuery,
  useGetStudentsByClassQuery,
  useGetMyClassesQuery,
  useGetStudentProgressQuery,
  useGetTeacherHomeworkQuery,
  useGetStudentHomeworkQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,

  useCreateExamMutation,
  useGetMyExamsQuery,
  useDeleteExamMutation,
  useUpdateExamMutation,

  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useGetResultsByExamQuery,
  useGetMarksheetQuery,
  useGetTeacherAcademicExamsQuery,

  useSaveBulkMarksMutation,
  useGetMarksByExamQuery,
  useSaveBulkAttendanceMutation,
  useGetAttendanceByExamQuery,

  useMarkHomeworkCheckMutation,
  useGetHomeworkCheckQuery,
  useMarkAttendanceMutation,
  useGetClassAttendanceQuery,
} = teacherApi;
