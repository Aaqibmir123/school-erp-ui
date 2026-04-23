import { useState } from "react";
import { setPassword } from "../api/auth.api";

export const useSetPassword = () => {
  const [loading, setLoading] = useState(false);

  const submitPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      await setPassword(token, password);
    } finally {
      setLoading(false);
    }
  };

  return { submitPassword, loading };
};
