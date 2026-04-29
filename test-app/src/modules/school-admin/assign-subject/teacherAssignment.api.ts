import { baseApi } from "@/src/store/api/baseApi";
import type { AssignSubjectPayload } from "@/shared-types/teacherAssignment.types";

/* ---------------- TYPES ---------------- */

interface AcademicYear {
  _id: string;
  isActive?: boolean;
  name: string;
}

/* ---------------- API ---------------- */

export const teacherAssignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ASSIGN SUBJECT */
    assignSubject: builder.mutation<{ message: string }, AssignSubjectPayload>({
      query: (body) => ({
        url: "/school-admin/teachers/assign-subject",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Teachers", "Subjects", "TeacherAssignments"],
    }),

    /* SET TEACHER PASSWORD */
    setTeacherPassword: builder.mutation<
      { message: string },
      { password: string }
    >({
      query: (body) => ({
        url: "/school-admin/teachers/set-password",
        method: "POST",
        body,
      }),
    }),

    /* GET ACADEMIC YEARS */
    getAcademicYears: builder.query<AcademicYear[], void>({
      query: () => ({
        url: "/school-admin/academic-years",
      }),
      transformResponse: (res: { data: AcademicYear[] }) => res.data,
      providesTags: ["AcademicYears"],
    }),
  }),
});

export const {
  useAssignSubjectMutation,
  useSetTeacherPasswordMutation,
  useGetAcademicYearsQuery,
} = teacherAssignmentApi;

