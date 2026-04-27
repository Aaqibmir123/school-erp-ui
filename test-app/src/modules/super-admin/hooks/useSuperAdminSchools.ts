"use client";

import { useEffect, useMemo, useState } from "react";

import {
  approveSchool,
  getAllSchools,
  getPendingSchools,
  updateSchoolStatus,
} from "../admin.api";

type SchoolItem = {
  _id: string;
  address?: string;
  email: string;
  phone: string;
  principalName: string;
  schoolName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export const useSuperAdminSchools = () => {
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [pendingSchools, setPendingSchools] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);

    try {
      const [all, pending] = await Promise.all([
        getAllSchools(),
        getPendingSchools(),
      ]);

      setSchools(all as SchoolItem[]);
      setPendingSchools(pending as SchoolItem[]);
    } catch {
      setSchools([]);
      setPendingSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await approveSchool(id);
    await fetchSchools();
  };

  const handleStatus = async (
    id: string,
    status: "PENDING" | "APPROVED" | "REJECTED",
  ) => {
    await updateSchoolStatus(id, status);
    await fetchSchools();
  };

  useEffect(() => {
    void fetchSchools();
  }, []);

  const counts = useMemo(() => {
    const total = schools.length;
    const pending = schools.filter((school) => school.status === "PENDING").length;
    const active = schools.filter((school) => school.status === "APPROVED").length;
    const disabled = schools.filter((school) => school.status === "REJECTED").length;

    return { active, disabled, pending, total };
  }, [schools]);

  return {
    counts,
    handleApprove,
    handleStatus,
    loading,
    pendingSchools,
    refetch: fetchSchools,
    schools,
  };
};
