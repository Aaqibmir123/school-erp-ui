"use client";

import { Alert } from "antd";
import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{ padding: "12px 16px", position: "sticky", top: 0, zIndex: 60 }}>
      <Alert
        showIcon
        type="warning"
        message="Network is slow or offline"
        description="The app will keep showing the loaded screen. Some actions may retry or fail until the connection comes back."
      />
    </div>
  );
}
