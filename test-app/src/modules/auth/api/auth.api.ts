import {
  ApplySchoolDTO,
  LoginDTO,
  LoginResponse,
} from "@/shared-types/auth.types";

import api from "../../../services/api";

type ApiEnvelope<T> = {
  data: T;
  message: string;
  success: boolean;
};

export const applySchoolApi = async (data: ApplySchoolDTO) => {
  const response = await api.post<ApiEnvelope<unknown>>("/auth/apply-school", data);

  return response.data.data;
};

export const loginApi = async (data: LoginDTO) => {
  const response = await api.post<ApiEnvelope<LoginResponse>>("/auth/login", data);

  return response.data.data;
};

export const setPassword = async (token: string, password: string) => {
  const response = await api.post<ApiEnvelope<unknown>>("/auth/set-password", {
    password,
    token,
  });

  return response.data.data;
};

