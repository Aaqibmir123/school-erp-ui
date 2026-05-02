import { baseApi } from "@/src/store/api/baseApi";

import type {
  ApplySchoolDTO,
  LoginDTO,
  LoginResponse,
} from "@/shared-types/auth.types";

type ApiEnvelope<T> = {
  data: T;
  message: string;
  success: boolean;
};

const syncSession = (session?: Pick<LoginResponse, "token" | "refreshToken">) => {
  if (typeof window === "undefined" || !session?.token) return;

  localStorage.setItem("token", session.token);

  if (session.refreshToken) {
    localStorage.setItem("refreshToken", session.refreshToken);
  }
};

const clearToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginDTO>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<LoginResponse>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          syncSession(data);
        } catch {
          // Error handling happens in the UI layer.
        }
      },
      invalidatesTags: ["Auth"],
    }),

    refreshSession: builder.mutation<LoginResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<LoginResponse>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          syncSession(data);
        } catch {
          clearToken();
        }
      },
      invalidatesTags: ["Auth"],
    }),

    getProfile: builder.query<LoginResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<LoginResponse>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          syncSession(data);
        } catch {
          // No-op: profile request is used as a session bootstrap.
        }
      },
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      keepUnusedDataFor: 300,
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<{ loggedOut: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      transformResponse: (response: ApiEnvelope<{ loggedOut: boolean }>) =>
        response.data,
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          clearToken();
        }
      },
      invalidatesTags: ["Auth"],
    }),

    applySchool: builder.mutation<unknown, ApplySchoolDTO>({
      query: (body) => ({
        url: "/auth/apply-school",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<unknown>) => response.data,
    }),

    setPassword: builder.mutation<
      unknown,
      {
        token: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/auth/set-password",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiEnvelope<unknown>) => response.data,
    }),
  }),
});

export const {
  useApplySchoolMutation,
  useGetProfileQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshSessionMutation,
  useSetPasswordMutation,
} = authApi;
