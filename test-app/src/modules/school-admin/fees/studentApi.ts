import { baseApi } from "@/src/store/api/baseApi";
import { ApiResponse } from "../../../../../shared-types/api.types";
import { StudentDTO } from "../../../../../shared-types/student.types";

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllStudentsByClass: builder.query<
      StudentDTO[],
      { classId: string; sectionId?: string }
    >({
      query: ({ classId, sectionId }) => ({
        url: "/school-admin/students/students/all",
        params: {
          classId,
          ...(sectionId && { sectionId }),
        },
      }),

      transformResponse: (res: ApiResponse<StudentDTO[]>) => {
        if (!res.success) throw new Error("API Error");
        return res.data || [];
      },

      providesTags: ["Students"],
      keepUnusedDataFor: 0,
    }),
  }),

  overrideExisting: true, // 🔥 avoid inject error
});

export const { useGetAllStudentsByClassQuery } = studentApi;
