"use client";
import { useEffect, useState } from "react";
import { getSchoolApi } from "./school.api";

export const useSchool = () => {
  const [school, setSchool] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSchool = async () => {
    try {
      setLoading(true);
      const data = await getSchoolApi();
      setSchool(data);
    } catch (error) {
      console.error("Error fetching school", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, []);

  return { school, loading, refetch: fetchSchool };
};
