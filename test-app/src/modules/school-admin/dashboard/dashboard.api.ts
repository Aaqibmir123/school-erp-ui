import { baseApi } from "@/src/store/api/baseApi";
import { ApiResponse } from "@/shared-types/api.types";
import { AdminDashboardSummary } from "@/shared-types/admin-dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardSummary: builder.query<AdminDashboardSummary, void>({
      query: () => ({
        url: "/school-admin/dashboard/summary",
      }),
      transformResponse: (res: ApiResponse<AdminDashboardSummary>) => res.data,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetAdminDashboardSummaryQuery } = dashboardApi;
