import { baseApi } from "@/src/store/api/baseApi";
import { ApiResponse } from "@/shared-types/api.types";
import {
  AdminDashboardOverview,
  AdminDashboardSummary,
} from "@/shared-types/admin-dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardOverview: builder.query<AdminDashboardOverview, void>({
      query: () => ({
        url: "/school-admin/dashboard/overview",
      }),
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      keepUnusedDataFor: 300,
      transformResponse: (res: ApiResponse<AdminDashboardOverview>) => res.data,
      providesTags: ["Dashboard"],
    }),

    getAdminDashboardSummary: builder.query<AdminDashboardSummary, void>({
      query: () => ({
        url: "/school-admin/dashboard/summary",
      }),
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      keepUnusedDataFor: 300,
      transformResponse: (res: ApiResponse<AdminDashboardSummary>) => res.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetAdminDashboardOverviewQuery,
  useGetAdminDashboardSummaryQuery,
} = dashboardApi;
