import { baseApi } from "@/src/store/api/baseApi";

/* =========================
   TYPES
========================= */

export interface TeacherAssignment {
  _id: string;

  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
  };

  subjectId: {
    _id: string;
    name: string;
  };

  classId: {
    _id: string;
    name: string;
  };

  academicYearId: string;
  academicYear?: {
    _id: string;
    name: string;
    isActive?: boolean;
  } | null;
}

interface GetTeacherAssignmentsResponse {
  success: boolean;
  data: TeacherAssignment[];
  total: number;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

/* =========================
   API
========================= */

export const teacherAssignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* GET ASSIGNMENTS */
    getTeacherAssignments: builder.query<
      GetTeacherAssignmentsResponse,
      { teacherId: string; page?: number; limit?: number }
    >({
      query: ({ teacherId, page = 1, limit = 10 }) => ({
        url: `/school-admin/teachers/${teacherId}/assignments`,
        params: { page, limit },
      }),
      providesTags: ["TeacherAssignments"],
    }),

    /* DELETE */
    deleteTeacherAssignment: builder.mutation<
      any,
      { id: string; forceDelete?: boolean }
    >({
      query: ({ id, forceDelete }) => ({
        url: `/school-admin/assignments/${id}`, // ✅ correct string
        method: "DELETE",
        body: { forceDelete },
      }),
      invalidatesTags: ["TeacherAssignments"],
    }),
  }),
});

export const {
  useGetTeacherAssignmentsQuery,
  useDeleteTeacherAssignmentMutation,
} = teacherAssignmentApi;
