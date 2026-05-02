import { baseApi } from "../baseQuery";

export type NoticeFeedItem = {
  _id: string;
  academicYearId?: {
    _id?: string;
    name?: string;
    isActive?: boolean;
  } | null;
  audience: string;
  body: string;
  createdAt?: string;
  createdByRole?: string;
  title: string;
  updatedAt?: string;
};

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNoticeFeed: builder.query<NoticeFeedItem[], void>({
      query: () => ({
        url: "/school-admin/notices/feed",
      }),
      transformResponse: (res: { data?: NoticeFeedItem[] }) =>
        Array.isArray(res?.data) ? res.data : [],
      providesTags: ["Notices"],
    }),
  }),
});

export const { useGetNoticeFeedQuery } = noticeApi;
