import { useCallback } from "react";

import { ApplySchoolDTO } from "@/shared-types/auth.types";

import { useApplySchoolMutation } from "../api/auth.api";

export const useApplySchool = () => {
  const [triggerApplySchool, result] = useApplySchoolMutation();

  const applySchool = useCallback(
    async (data: ApplySchoolDTO) => {
      const response = await triggerApplySchool(data).unwrap();
      return response;
    },
    [triggerApplySchool],
  );

  return { applySchool, loading: result.isLoading };
};
