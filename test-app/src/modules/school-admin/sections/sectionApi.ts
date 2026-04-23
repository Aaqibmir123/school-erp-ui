import { baseApi } from "@/src/store/api/baseApi";

import type {
  CreateSectionsDTO,
  CreateSectionsResponse,
  Section,
  SectionQueryDTO,
} from "../../../../../shared-types/section.types";

export const sectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= GET ALL ================= */

    getSections: builder.query<Section[], SectionQueryDTO>({
      query: (params) => ({
        url: "/school-admin/sections",
        params,
      }),
      transformResponse: (res: { data: Section[] }) => res.data,
      providesTags: ["Sections"],
    }),

    /* ================= GET BY CLASS ================= */

    getSectionsByClass: builder.query<Section[], string>({
      query: (classId) => ({
        url: `/school-admin/sections/class/${classId}`,
      }),
      transformResponse: (res: { data: Section[] }) => res.data,
      providesTags: ["Sections"],
    }),

    /* ================= CREATE ================= */

    createSections: builder.mutation<
      CreateSectionsResponse[],
      CreateSectionsDTO
    >({
      query: (body) => ({
        url: "/school-admin/sections",
        method: "POST",
        body,
      }),
      transformResponse: (res: { data: CreateSectionsResponse[] }) => res.data,
      invalidatesTags: ["Sections"],
    }),

    /* ================= DELETE ================= */

    deleteSection: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/sections/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sections"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetSectionsQuery,
  useGetSectionsByClassQuery,
  useCreateSectionsMutation,
  useDeleteSectionMutation,
} = sectionApi;
