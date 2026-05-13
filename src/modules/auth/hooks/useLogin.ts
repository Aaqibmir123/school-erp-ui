import { useCallback } from "react";

import { LoginDTO, LoginResponse } from "@/shared-types/auth.types";

import { useLoginMutation } from "../api/auth.api";

export const useLogin = () => {
  const [triggerLogin, result] = useLoginMutation();

  const login = useCallback(
    async (data: LoginDTO) => {
      return (await triggerLogin(data).unwrap()) as LoginResponse;
    },
    [triggerLogin],
  );

  return { login, loading: result.isLoading };
};
