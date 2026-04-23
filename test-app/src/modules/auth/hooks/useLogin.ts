import { useCallback, useState } from "react";
import {
  LoginDTO,
  LoginResponse,
} from "../../../../../shared-types/auth.types";
import { loginApi } from "../api/auth.api";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (data: LoginDTO) => {
    try {
      setLoading(true);

      const result = (await loginApi(data)) as LoginResponse;
      localStorage.setItem("token", result.token);

      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading };
};
