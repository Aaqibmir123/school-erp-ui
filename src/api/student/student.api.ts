import { DashboardData } from "../../../shared-types/dashboard";
import { baseApi } from "../../api/baseQuery";

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= TIMETABLE ================= */
    // ❌ studentId hata diya

    getTodayTimetable: builder.query<any[], void>({
      query: () => ({
        url: "/student/today",
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Timetable"],
    }),

    getWeeklyTimetable: builder.query<Record<string, any[]>, void>({
      query: () => ({
        url: "/student/weekly",
      }),
      transformResponse: (res: any) => res?.data || {},
      providesTags: ["Timetable"],
    }),

    /* ================= EXAMS ================= */
    // ✅ studentId required

    getStudentExams: builder.query<any[], { studentId: string }>({
      query: ({ studentId }) => ({
        url: "/student/exams",
        params: { studentId },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Exam"],
    }),

    /* ================= MARKS ================= */

    getMyMarks: builder.query<any[], { studentId: string }>({
      query: ({ studentId }) => ({
        url: "/student/my-marks",
        params: { studentId },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Results"],
    }),

    /* ================= HOMEWORK ================= */

    getStudentHomeworkList: builder.query<
      any,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/homework/student",
        params: { page, limit },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Homework"],
    }),

    /* ================= ATTENDANCE ================= */

    markStudentAttendance: builder.mutation({
      query: (body) => ({
        url: "/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getTodayAttendance: builder.query<any[], { studentId: string }>({
      query: ({ studentId }) => ({
        url: "/attendance/student/today",
        params: { studentId },
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Attendance"],
    }),

    getAttendanceSummary: builder.query<any, { studentId: string }>({
      query: ({ studentId }) => ({
        url: "/attendance/student/summary",
        params: { studentId },
      }),
      transformResponse: (res: any) => res?.data || {},
      providesTags: ["Attendance"],
    }),

    getAttendanceHistory: builder.query<
      any[],
      { studentId: string; page?: number; limit?: number }
    >({
      query: ({ studentId, page = 1, limit = 10 }) => ({
        url: "/attendance/student",
        params: { studentId, page, limit }, // ✅ FIXED (missing tha)
      }),

      serializeQueryArgs: ({ endpointName }) => endpointName,

      merge: (currentCache, newItems) => {
        currentCache.push(...newItems);
      },

      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },

      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Attendance"],
    }),

    /* ================= DASHBOARD ================= */

    getDashboard: builder.query<DashboardData, { studentId: string }>({
      query: ({ studentId }) => ({
        url: "/student/dashboard",
        params: { studentId },
      }),
      transformResponse: (res: any) => res?.data || ({} as DashboardData),
      providesTags: ["Dashboard"],
    }),
    getMyFees: builder.query<any[], void>({
      query: () => "/student/fees",

      transformResponse: (res: any) => res.data,

      providesTags: ["Fees"],
    }),
  }),
});

/* ================= HOOKS ================= */

export const {
  useGetTodayTimetableQuery,
  useGetWeeklyTimetableQuery,
  useGetStudentExamsQuery,
  useGetMyMarksQuery,
  useGetStudentHomeworkListQuery,
  useMarkStudentAttendanceMutation,
  useGetTodayAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceHistoryQuery,
  useGetDashboardQuery,
  useGetMyFeesQuery,
} = studentApi;
