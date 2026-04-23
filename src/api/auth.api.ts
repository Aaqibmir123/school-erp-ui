import { baseApi } from "../api/baseQuery";

/* ================= TYPES ================= */

export interface LoginPayload {
  phone?: string;
  email?: string;
  password: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface FirebaseLoginPayload {
  idToken: string;
}

/* 🔥 COMMON RESPONSE TYPE */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/* 🔥 AUTH RESPONSE TYPE (IMPORTANT) */
export interface AuthResponse {
  token: string;
  user: any;
  students?: any[];
}

/* ================= API ================= */

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* ================= CHECK USER ================= */
    checkUser: builder.mutation<{ role: string }, string>({
      query: (phone) => ({
        url: "/auth/check-user",
        method: "POST",
        body: { phone },
      }),
      transformResponse: (res: ApiResponse<{ role: string }>) => {
        if (!res.success) throw new Error(res.message || "Error");
        return res.data;
      },
    }),

    /* ================= LOGIN ================= */
    login: builder.mutation<AuthResponse, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<AuthResponse>) => {
        if (!res.success) throw new Error(res.message || "Login failed");
        return res.data;
      },
    }),

    /* ================= SEND OTP ================= */
    sendOtp: builder.mutation<{ sent: boolean }, string>({
      query: (phone) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: { phone },
      }),
      transformResponse: (res: ApiResponse<{ sent: boolean }>) => {
        if (!res.success) throw new Error(res.message || "OTP send failed");
        return res.data;
      },
    }),

    /* ================= VERIFY OTP ================= */
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<AuthResponse>) => {
        if (!res.success) throw new Error(res.message || "OTP failed");
        return res.data;
      },
    }),

    /* ================= FIREBASE LOGIN ================= */
    firebaseLogin: builder.mutation<AuthResponse, FirebaseLoginPayload>({
      query: (body) => ({
        url: "/auth/firebase-login",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiResponse<AuthResponse>) => {
        if (!res.success) {
          throw new Error(res.message || "Firebase login failed");
        }
        return res.data;
      },
    }),
  }),

  overrideExisting: true,
});

/* ================= HOOKS ================= */

export const {
  useCheckUserMutation,
  useLoginMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useFirebaseLoginMutation,
} = authApi;
