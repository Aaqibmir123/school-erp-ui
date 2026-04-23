import api from "@/src/services/api"; // axios instance

export const getSchoolApi = async () => {
  const res = await api.get("/school");
  return res.data;
};

export const createSchoolApi = async (data: FormData) => {
  const res = await api.post("/school", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};
