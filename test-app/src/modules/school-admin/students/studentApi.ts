import { baseApi } from "@/src/store/api/baseApi";

import type {
  BulkImportResponse,
  CreateStudentDTO,
  GetStudentsParams,
  PreviewStudentsResponse,
  StudentPopulated,
} from "@/shared-types/student.types";

/* ================= RESPONSE TYPE ================= */
export interface StudentsApiResponse {
  success: boolean;
  data: StudentPopulated[];
  total: number;
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= GET ================= */
    getStudents: builder.query<
      StudentsApiResponse,
      GetStudentsParams & { sectionId?: string }
    >({
      query: (params) => ({
        url: "/school-admin/students",
        params,
      }),
      transformResponse: (res: {
        success?: boolean;
        students?: StudentPopulated[];
        total?: number;
      }) => ({
        success: Boolean(res?.success),
        data: Array.isArray(res?.students) ? res.students : [],
        total: Number(res?.total || 0),
      }),

      providesTags: ["Students"],
    }),

    /* ================= GET BY ID ================= */
    getStudentById: builder.query<StudentPopulated, string>({
      query: (id) => ({
        url: `/school-admin/students/${id}`,
      }),
      transformResponse: (res: { data?: StudentPopulated }) =>
        res.data as StudentPopulated,
      providesTags: ["Students"],
    }),

    /* ================= CREATE ================= */
    createStudent: builder.mutation<unknown, CreateStudentDTO>({
      query: (body) => ({
        url: "/school-admin/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students", "Dashboard"],
    }),

    /* ================= UPDATE ================= */
    updateStudent: builder.mutation<
      unknown,
      { id: string; body: Partial<CreateStudentDTO> }
    >({
      query: ({ id, body }) => ({
        url: `/school-admin/students/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Students", "Dashboard"],
    }),

    /* ================= DELETE ================= */
    deleteStudent: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/school-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students", "Dashboard"],
    }),

    /* ================= TEMPLATE ================= */
    downloadTemplate: builder.mutation<Blob, void>({
      query: () => ({
        url: "/school-admin/students/template",
        method: "GET",
        responseHandler: (res: Response) => res.blob(),
      }),
    }),

    /* ================= PREVIEW ================= */
    previewStudents: builder.mutation<PreviewStudentsResponse, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/school-admin/students/bulk-preview",
          method: "POST",
          body: formData,
        };
      },
    }),

    /* ================= IMPORT ================= */
    importStudents: builder.mutation<
      BulkImportResponse,
      { students: Record<string, unknown>[] }
    >({
      query: (body) => ({
        url: "/school-admin/students/bulk-import",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students", "Dashboard"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useGetStudentByIdQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation, // 💣 NEW
  useDeleteStudentMutation, // 💣 NEW
  useDownloadTemplateMutation,
  usePreviewStudentsMutation,
  useImportStudentsMutation,
} = studentApi;

