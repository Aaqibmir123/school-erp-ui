import { baseApi } from "@/src/store/api/baseApi";

/* =========================
   TYPES
========================= */

export interface Teacher {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  status?: "active" | "inactive";
  subjects?: string[]; // optional (only for class filter API)
  createdAt?: string;
}

interface BaseResponse<T> {
  success: boolean;
  data?: T;
  teachers?: T;
  message?: string;
}

/* =========================
   API
========================= */

export const teacherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* =========================
       GET ALL TEACHERS
    ========================= */
    getTeachers: builder.query<Teacher[], void>({
      query: () => ({
        url: "/school-admin/teachers",
      }),
      transformResponse: (res: BaseResponse<Teacher[]>) => res.data || [],
      providesTags: ["Teachers"],
    }),

    /* =========================
       CREATE TEACHER
    ========================= */
    createTeacher: builder.mutation<void, FormData>({
      query: (formData) => ({
        url: "/school-admin/teachers",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Teachers"],
    }),

    /* =========================
       UPDATE TEACHER
    ========================= */
    updateTeacher: builder.mutation<
      void,
      { id: string; data: Partial<Teacher> }
    >({
      query: ({ id, data }) => ({
        url: `/school-admin/teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teachers"],
    }),

    /* =========================
       DELETE TEACHER
    ========================= */
    deleteTeacher: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/teacher/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),

    /* =========================
       GET TEACHERS BY CLASS
    ========================= */
    getTeachersByClass: builder.query<Teacher[], string>({
      query: (classId) => ({
        url: `/school-admin/by-class?classId=${classId}`,
      }),
      transformResponse: (res: BaseResponse<Teacher[]>) => res.teachers || [],
      providesTags: ["Teachers"],
    }),
  }),
});

/* =========================
   HOOKS
========================= */

export const {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeachersByClassQuery,
} = teacherApi;
