import api from "@/src/services/api";
export const getAcademicYears = async () => {
  const res = await api.get("/academic-year");
  return res.data;
};

export const createAcademicYear = async (data: { name: string }) => {
  const res = await api.post("/academic-year", data);
  return res.data;
};

export const setActiveYear = async (id: string) => {
  const res = await api.patch(`/academic-year/set-active/${id}`);
  return res.data;
};
