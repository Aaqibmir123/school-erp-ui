"use client";

import { App } from "antd";
import { useEffect } from "react";

import { setToastApi } from "@/src/utils/toast";

export default function ToastBridge() {
  const { message } = App.useApp();

  useEffect(() => {
    setToastApi(message);

    return () => setToastApi(null);
  }, [message]);

  return null;
}
