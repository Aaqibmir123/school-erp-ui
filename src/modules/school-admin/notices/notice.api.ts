import { baseApi } from "@/src/store/api/baseApi";

export type NoticeItem = {
  _id: string;
  academicYearId?: {
    _id: string;
    isActive?: boolean;
    name?: string;
  } | null;
  audience: string;
  body: string;
  createdAt: string;
  title: string;
};

export type NoticePayload = {
  academicYearId?: string;
  audience: string;
  body: string;
  title: string;
};

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotices: builder.query<NoticeItem[], { academicYearId?: string } | void>({
      query: (params) => ({
        url: "/school-admin/notices",
        params: params?.academicYearId ? { academicYearId: params.academicYearId } : undefined,
      }),
      transformResponse: (res: { data: NoticeItem[] }) => res.data || [],
      providesTags: ["Notices"],
    }),
    createNotice: builder.mutation<{ message?: string; success?: boolean }, NoticePayload>({
      query: (body) => ({
        url: "/school-admin/notices",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notices"],
    }),
    updateNotice: builder.mutation<
      { message?: string; success?: boolean },
      { id: string; data: NoticePayload }
    >({
      query: ({ id, data }) => ({
        url: `/school-admin/notices/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Notices"],
    }),
    deleteNotice: builder.mutation<{ message?: string; success?: boolean }, string>({
      query: (id) => ({
        url: `/school-admin/notices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notices"],
    }),
  }),
});

export const {
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
  useGetNoticesQuery,
  useUpdateNoticeMutation,
} = noticeApi;
