import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let toastApi: MessageInstance | null = null;

type ApiResponseLike = {
  message?: string;
  success?: boolean;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readMessage = (value: unknown, fallback: string) => {
  if (!isObject(value)) {
    return fallback;
  }

  const data = isObject(value.data) ? value.data : undefined;

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof value.error === "string") {
    return value.error;
  }

  if (typeof value.message === "string") {
    return value.message;
  }

  return fallback;
};

export const setToastApi = (api: MessageInstance | null) => {
  toastApi = api;
};

const getToastApi = () => toastApi || message;

export const showToast = {
  success: (msg: string) => getToastApi().success(msg),
  error: (msg: string) => getToastApi().error(msg),
  warning: (msg: string) => getToastApi().warning(msg),
  info: (msg: string) => getToastApi().info(msg),

  apiResponse: (res: unknown, fallback = "Something went wrong") => {
    const response = isObject(res) ? (res as ApiResponseLike) : null;

    if (response?.success) {
      getToastApi().success(response.message || "Success");
    } else {
      getToastApi().error(readMessage(res, fallback));
    }
  },

  apiError: (err: unknown, fallback = "Something went wrong") => {
    const msg = readMessage(err, fallback);
    getToastApi().error(msg);
  },
};
