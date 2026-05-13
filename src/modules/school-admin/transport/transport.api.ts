import { baseApi } from "@/src/store/api/baseApi";
import { ApiResponse } from "@/shared-types/api.types";
import {
  TransportPayload,
  TransportRecord,
} from "@/shared-types/transport.types";

export const transportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransports: builder.query<TransportRecord[], void>({
      query: () => ({
        url: "/school-admin/transport",
      }),
      transformResponse: (res: ApiResponse<TransportRecord[]>) => res.data || [],
      providesTags: ["Transport"],
    }),
    createTransport: builder.mutation<TransportRecord, TransportPayload>({
      query: (body) => ({
        url: "/school-admin/transport",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transport", "Dashboard"],
    }),
    updateTransport: builder.mutation<
      TransportRecord,
      { id: string; data: Partial<TransportPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/school-admin/transport/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Transport", "Dashboard"],
    }),
    deleteTransport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/school-admin/transport/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Transport", "Dashboard"],
    }),
  }),
});

export const {
  useGetTransportsQuery,
  useCreateTransportMutation,
  useUpdateTransportMutation,
  useDeleteTransportMutation,
} = transportApi;
