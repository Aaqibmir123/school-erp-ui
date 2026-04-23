import api from "@/src/services/api";
import { CreateClassesDTO } from "../../../../../../shared-types/class.types";

/* TYPES */

export type ClassItem = {
  _id: string;
  name: string;
};

type GetClassesResponse = {
  data: ClassItem[];
};

/* CREATE */

export const createClassesApi = async (data: CreateClassesDTO) => {
  const res = await api.post("/school-admin/classes", data);
  return res.data;
};

/* GET */

export const getClassesApi = async (): Promise<ClassItem[]> => {
  const res = await api.get<GetClassesResponse>("/school-admin/classes");
  return res.data.data;
};
