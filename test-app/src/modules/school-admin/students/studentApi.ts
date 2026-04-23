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

      // transformResponse: (res: any) => ({
      //   success: res.success,
      //   data: res || [],
      //   total: res.total || 0,
      // }),

      providesTags: ["Students"],
    }),

    /* ================= CREATE ================= */
    createStudent: builder.mutation<any, CreateStudentDTO>({
      query: (body) => ({
        url: "/school-admin/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    /* ================= UPDATE ================= */
    updateStudent: builder.mutation<
      any,
      { id: string; body: Partial<CreateStudentDTO> }
    >({
      query: ({ id, body }) => ({
        url: `/school-admin/students/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    /* ================= DELETE ================= */
    deleteStudent: builder.mutation<any, string>({
      query: (id) => ({
        url: `/school-admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
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
    importStudents: builder.mutation<BulkImportResponse, { students: any[] }>({
      query: (body) => ({
        url: "/school-admin/students/bulk-import",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation, // 💣 NEW
  useDeleteStudentMutation, // 💣 NEW
  useDownloadTemplateMutation,
  usePreviewStudentsMutation,
  useImportStudentsMutation,
} = studentApi;

