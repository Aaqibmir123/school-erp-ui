"use client";

import { useEffect, useMemo } from "react";

import { APP_ENV } from "@/src/config/env";
import { SchoolProfile, useGetSchoolQuery } from "./school.api";

const resolveAssetUrl = (value?: string) => {
  if (!value) return undefined;

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }

  return `${APP_ENV.SERVER_URL}${value.startsWith("/") ? "" : "/"}${value}`;
};

const normalizeSchool = (data: SchoolProfile | null | undefined) =>
  data
    ? {
        ...data,
        logo: resolveAssetUrl(data.logo),
        seal: resolveAssetUrl(data.seal),
        signature: resolveAssetUrl(data.signature),
      }
    : null;

export const useSchool = (_refreshKey?: string) => {
  const { data, isLoading, isFetching, refetch } = useGetSchoolQuery();

  const school = useMemo(() => normalizeSchool(data), [data]);

  useEffect(() => {
    const handleSchoolUpdated = () => {
      void refetch();
    };

    window.addEventListener("school-profile-updated", handleSchoolUpdated);

    return () => {
      window.removeEventListener("school-profile-updated", handleSchoolUpdated);
    };
  }, [refetch]);

  return { school, loading: isLoading, refetch };
};
