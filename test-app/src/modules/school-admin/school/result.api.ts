import api from "@/src/services/api";

export const getStudentResultApi = async (examId: string) => {
  const res = await api.get(`/result/${examId}`);
  return res.data;
};
