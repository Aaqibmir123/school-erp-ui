import { useCallback } from "react";

import type { ApplySchoolRequestBody } from "../api/auth.api";

import { useApplySchoolMutation } from "../api/auth.api";

export const useApplySchool = () => {
  const [triggerApplySchool, result] = useApplySchoolMutation();

  const applySchool = useCallback(
    async (data: ApplySchoolRequestBody) => {
      const response = await triggerApplySchool(data).unwrap();
      return response;
    },
    [triggerApplySchool],
  );

  return { applySchool, loading: result.isLoading };
};
