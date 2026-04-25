import api from "@/src/services/api";
export const getAcademicYears = async () => {
  const res = await api.get("/school-admin/academic-years");
  return res.data?.data ?? [];
};

export const createAcademicYear = async (data: { name: string }) => {
  const res = await api.post("/school-admin/academic-years", data);
  return res.data?.data ?? null;
};

export const setActiveYear = async (id: string) => {
  const res = await api.patch(`/school-admin/academic-years/set-active/${id}`);
  return res.data?.data ?? null;
};
