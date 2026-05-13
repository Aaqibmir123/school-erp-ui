import { ApplySchoolDto } from "@/shared-types/school.types";
import api from "../../services/api";

export const getPendingSchools = async (): Promise<ApplySchoolDto[]> => {
  const res = await api.get<{ data: ApplySchoolDto[] }>(
    "/admin/pending-schools",
  );
  return res.data.data;
};

export const getAllSchools = async (): Promise<
  (ApplySchoolDto & { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" })[]
> => {
  const res = await api.get<{ data: (ApplySchoolDto & { _id: string; status: "PENDING" | "APPROVED" | "REJECTED" })[] }>(
    "/admin/schools",
  );
  return res.data.data;
};

export const approveSchool = async (
  id: string,
): Promise<{ message: string }> => {
  const res = await api.patch<{ message: string }>(
    `/admin/approve-school/${id}`,
  );
  return res.data;
};

export const updateSchoolStatus = async (
  id: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
): Promise<{ message: string }> => {
  const res = await api.patch<{ message: string }>(
    `/admin/school-status/${id}`,
    { status },
  );
  return res.data;
};

