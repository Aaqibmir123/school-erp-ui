import { baseApi } from "@/src/store/api/baseApi";
import { ApiResponse } from "@/shared-types/api.types";
import { Fee } from "@/shared-types/fee.types";

/* ================= TYPES ================= */

// 🔥 Receipt Response Type
type GenerateReceiptResponse = {
  success: boolean;
  data: {
    receiptId: string;
    receiptNumber: string;
    pdfUrl: string;
  };
};

type FeePayload = Partial<Fee> & {
  studentId: string;
};

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= GET ================= */

    getFeesByStudent: builder.query<Fee[], string>({
      query: (studentId) => ({
        url: `/school-admin/fee/student/${studentId}`,
      }),

      transformResponse: (res: ApiResponse<Fee[]>) => {
        if (!res.success) throw new Error("API Error");
        return res.data || [];
      },

      providesTags: (result, error, studentId) => [
        { type: "Fee", id: studentId },
      ],
    }),

    /* ================= CREATE ================= */

    createFee: builder.mutation<Fee, FeePayload>({
      query: (body) => ({
        url: "/school-admin/fee",
        method: "POST",
        body,
      }),

      invalidatesTags: (result, error, body) => [
        "Dashboard",
        { type: "Fee", id: body.studentId },
      ],
    }),

    /* ================= UPDATE ================= */

    updateFee: builder.mutation<Fee, { id: string } & FeePayload>({
      query: ({ id, ...body }) => ({
        url: `/school-admin/fee/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (result, error, body) => [
        "Dashboard",
        { type: "Fee", id: body.studentId },
      ],
    }),

    /* ================= DELETE ================= */

    deleteFee: builder.mutation<
      { success: boolean },
      { id: string; studentId: string }
    >({
      query: ({ id }) => ({
        url: `/school-admin/fee/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: (result, error, arg) => [
        "Dashboard",
        { type: "Fee", id: arg.studentId },
      ],
    }),

    /* ================= GENERATE RECEIPT ================= */

    generateReceipt: builder.mutation<
      GenerateReceiptResponse,
      {
        studentId: string;
        feeIds: string[];
      }
    >({
      query: (body) => ({
        url: "/school-admin/fees/generate-receipt",
        method: "POST",
        body,
      }),

      transformResponse: (res: GenerateReceiptResponse) => {
        if (!res.success) throw new Error("Receipt generation failed");
        return res;
      },

      // 🔥 MOST IMPORTANT FIX
      invalidatesTags: (result, error, body) => [
        "Dashboard",
        { type: "Fee", id: body.studentId },
      ],
    }),
  }),

  overrideExisting: true,
});

/* ================= HOOKS ================= */

export const {
  useGetFeesByStudentQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  useGenerateReceiptMutation,
} = feeApi;

