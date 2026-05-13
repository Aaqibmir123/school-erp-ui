import { baseApi } from "@/src/store/api/baseApi";

type AttendanceHistoryItem = {
  _id: string;
  status: string;
  mode?: string;
  reason?: string;
  date: string;
  studentId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    rollNumber?: number | string;
    classId?: string;
    sectionId?: string;
  };
  subjectId?: {
    _id?: string;
    name?: string;
  };
  periodId?: {
    _id?: string;
    startTime?: string;
    endTime?: string;
  };
};

type TeacherAttendanceHistoryItem = {
  _id: string;
  status: string;
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  note?: string;
  teacherId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    employeeId?: string;
    phone?: string;
  };
};

type AttendanceHistoryResponse = {
  data: AttendanceHistoryItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAttendanceHistory: builder.query<
      AttendanceHistoryResponse,
      {
        classId?: string;
        sectionId?: string;
        subjectId?: string;
        studentId?: string;
        mode?: string;
        from?: string;
        to?: string;
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/attendance/history",
        params,
      }),
      transformResponse: (res: any) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta,
      }),
      providesTags: ["Attendance"],
    }),

    getTeacherAttendanceHistory: builder.query<
      {
        data: TeacherAttendanceHistoryItem[];
        meta?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      {
        search?: string;
        status?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/attendance/teacher-history",
        params,
      }),
      transformResponse: (res: any) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta,
      }),
      providesTags: ["Attendance"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttendanceHistoryQuery,
  useGetTeacherAttendanceHistoryQuery,
} = attendanceApi;
