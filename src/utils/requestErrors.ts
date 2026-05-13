type StatusErrorLike = {
  status?: number | string;
};

export const isAuthStatusError = (error: unknown) => {
  const status = (error as StatusErrorLike | null | undefined)?.status;
  return status === 401 || status === 403;
};

export const isNetworkStatusError = (error: unknown) => {
  const status = (error as StatusErrorLike | null | undefined)?.status;

  return (
    status === "FETCH_ERROR" ||
    status === "TIMEOUT_ERROR" ||
    status === "CUSTOM_ERROR"
  );
};

export const isOnline = () => {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
};

export const isAxiosNetworkError = (error: unknown) => {
  const candidate = error as {
    code?: string;
    message?: string;
    response?: { status?: number };
  };

  return (
    candidate?.code === "ERR_NETWORK" ||
    candidate?.code === "ECONNABORTED" ||
    !candidate?.response ||
    /network|timeout/i.test(candidate?.message || "")
  );
};
