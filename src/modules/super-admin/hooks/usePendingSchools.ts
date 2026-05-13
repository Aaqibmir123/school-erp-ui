import { useEffect, useState } from "react";
import { approveSchool, getPendingSchools } from "../admin.api";

export const usePendingSchools = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchools = async () => {
    setLoading(true);
    const data = await getPendingSchools();
    setSchools(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await approveSchool(id);
    await fetchSchools(); // table refresh
  };

  useEffect(() => {
    const load = async () => {
      await fetchSchools();
    };

    load();
  }, []);

  return {
    schools,
    loading,
    handleApprove, // ⚠️ YE RETURN HONA ZAROORI HAI
  };
};
