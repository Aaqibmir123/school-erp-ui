import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

let toastApi: MessageInstance | null = null;

export const setToastApi = (api: MessageInstance | null) => {
  toastApi = api;
};

const getToastApi = () => toastApi || message;

export const showToast = {
  success: (msg: string) => getToastApi().success(msg),
  error: (msg: string) => getToastApi().error(msg),
  warning: (msg: string) => getToastApi().warning(msg),
  info: (msg: string) => getToastApi().info(msg),

  apiResponse: (res: any, fallback = "Something went wrong") => {
    if (res?.success) {
      getToastApi().success(res.message || "Success");
    } else {
      getToastApi().error(res?.message || fallback);
    }
  },

  apiError: (err: any, fallback = "Something went wrong") => {
    const msg = err?.data?.message || err?.error || err?.message || fallback;
    getToastApi().error(msg);
  },
};
