import { baseApi } from "@/src/store/api/baseApi";
import type {
  CreatePeriodDTO,
  Period,
} from "../../../../../shared-types/period.types";

export const periodApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* GET PERIODS */
    getPeriods: builder.query<Period[], void>({
      query: () => ({
        url: "/school-admin/periods",
      }),
      providesTags: ["Periods"],
    }),

    /* CREATE PERIOD */
    createPeriod: builder.mutation<void, CreatePeriodDTO>({
      query: (body) => ({
        url: "/school-admin/periods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Periods"],
    }),

    /* DELETE PERIOD */
    deletePeriod: builder.mutation<any, { id: string; forceDelete?: boolean }>({
      query: ({ id, forceDelete }) => ({
        url: `/school-admin/periods/${id}`,
        method: "DELETE",
        body: { forceDelete }, // 💣 IMPORTANT
      }),
      invalidatesTags: ["Periods"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPeriodsQuery,
  useCreatePeriodMutation,
  useDeletePeriodMutation,
} = periodApi;
