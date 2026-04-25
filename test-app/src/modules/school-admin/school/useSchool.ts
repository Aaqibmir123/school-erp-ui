"use client";

import { useEffect, useState } from "react";

import { APP_ENV } from "@/src/config/env";
import { getSchoolApi } from "./school.api";

type SchoolProfile = {
  address?: string;
  logo?: string;
  name?: string;
  schoolName?: string;
  seal?: string;
  signature?: string;
};

const resolveAssetUrl = (value?: string) => {
  if (!value) return "";

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  return `${APP_ENV.SERVER_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

export const useSchool = (refreshKey?: string) => {
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSchool = async () => {
    try {
      setLoading(true);
      const data: SchoolProfile | null = await getSchoolApi();
      setSchool(
        data
          ? {
              ...data,
              logo: resolveAssetUrl(data.logo),
              seal: resolveAssetUrl(data.seal),
              signature: resolveAssetUrl(data.signature),
            }
          : null,
      );
    } catch (error) {
      console.error("Error fetching school", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refetch when the layout path changes so the header reflects the latest
    // school name/logo immediately after saving the profile page.
    fetchSchool();
  }, [refreshKey]);

  useEffect(() => {
    const handleSchoolUpdated = () => {
      fetchSchool();
    };

    window.addEventListener("school-profile-updated", handleSchoolUpdated);

    return () => {
      window.removeEventListener("school-profile-updated", handleSchoolUpdated);
    };
  }, []);

  return { school, loading, refetch: fetchSchool };
};
