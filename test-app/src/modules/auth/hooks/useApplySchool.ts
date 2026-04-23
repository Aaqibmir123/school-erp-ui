import { useState, useCallback } from "react";
import { applySchoolApi } from "../api/auth.api";
import { ApplySchoolDTO } from "@/shared-types/auth.types";

export const useApplySchool = () => {
  const [loading, setLoading] = useState(false);

  const applySchool = useCallback(async (data: ApplySchoolDTO) => {
    try {
      setLoading(true);

      const result = await applySchoolApi(data);

      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { applySchool, loading };
};

