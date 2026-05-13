import { useCallback } from "react";

import { useSetPasswordMutation } from "../api/auth.api";

export const useSetPassword = () => {
  const [triggerSetPassword, result] = useSetPasswordMutation();

  const submitPassword = useCallback(
    async (token: string, password: string) => {
      await triggerSetPassword({ token, password }).unwrap();
    },
    [triggerSetPassword],
  );

  return { submitPassword, loading: result.isLoading };
};
