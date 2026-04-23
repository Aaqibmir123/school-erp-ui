import type {
    AttendanceItem,
    MarkAttendancePayload,
} from "../../../../shared-types/attendance.types";
import { baseApi } from "../../../api/baseQuery";

export const studentAttendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    markAttendance: builder.mutation<
      { message: string },
      MarkAttendancePayload
    >({
      query: (body) => ({
        url: "/attendance",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getTodayAttendance: builder.query<AttendanceItem[], void>({
      query: () => ({
        url: "/attendance/student/today",
      }),
      transformResponse: (res: any) => res?.data || [],
      providesTags: ["Attendance"],
    }),
  }),
});

export const { useMarkAttendanceMutation, useGetTodayAttendanceQuery } =
  studentAttendanceApi;
