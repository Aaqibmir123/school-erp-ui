import { baseApi } from "@/src/store/api/baseApi";
import {
  IClassSubjects,
  ISubject,
} from "@/shared-types/subject.types";

/* =========================
   API
========================= */

export const subjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* GET ALL */
    getSubjects: builder.query<IClassSubjects[], void>({
      query: () => "/school-admin/subjects",
      transformResponse: (res: { data: IClassSubjects[] }) => res.data,
      providesTags: ["Subjects"],
    }),

    /* GET BY CLASS */
    getSubjectsByClass: builder.query<ISubject[], string>({
      query: (classId) => `/school-admin/subjects/class/${classId}`,
      transformResponse: (res: { data: ISubject[] }) => res.data,
      providesTags: ["Subjects"],
    }),

    /* CREATE */
    createSubjects: builder.mutation<
      IClassSubjects,
      { classId: string; subjects: string[] }
    >({
      query: (data) => ({
        url: "/school-admin/subjects",
        method: "POST",
        body: data,
      }),
      transformResponse: (res: { data: IClassSubjects }) => res.data,
      invalidatesTags: ["Subjects"],
    }),

    /* DELETE */
    deleteSubject: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subjects"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useGetSubjectsByClassQuery,
  useCreateSubjectsMutation,
  useDeleteSubjectMutation,
} = subjectApi;

