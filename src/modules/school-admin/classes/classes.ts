import { baseApi } from "@/src/store/api/baseApi";
import type {
    ClassResponse,
    CreateClassesDTO,
} from "@/shared-types/class.types";

export const classApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* GET CLASSES */
    getClasses: builder.query<ClassResponse[], void>({
      query: () => ({
        url: "/school-admin/classes",
      }),
      transformResponse: (res: { data: ClassResponse[] }) => res.data,
      providesTags: ["Classes"],
    }),

    /* CREATE CLASS */
    createClass: builder.mutation<{ message: string }, CreateClassesDTO>({
      query: (body) => ({
        url: "/school-admin/classes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classes", "Dashboard"],
    }),
  }),
});

export const { useGetClassesQuery, useCreateClassMutation } = classApi;

