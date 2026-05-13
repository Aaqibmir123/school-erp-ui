type AuthErrorLike = {
  data?: {
    message?: string;
  };
  error?: string;
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const getAuthErrorMessage = (
  error: unknown,
  fallback = "Something went wrong",
) => {
  const authError = error as AuthErrorLike;

  return (
    authError?.data?.message ||
    authError?.response?.data?.message ||
    authError?.error ||
    authError?.message ||
    fallback
  );
};
