"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ClockCircleOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";

export default function ApplicationPendingPage() {
  const router = useRouter();

  /* 🔥 AUTO REDIRECT */
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push("/");
  };

  return (
    <div style={styles.container}>
      <Result
        icon={<ClockCircleOutlined style={{ color: "#faad14" }} />}
        title="Application Under Review"
        subTitle="Your school registration has been submitted successfully. Please wait for approval from the system administrator."
        extra={[
          <Button type="primary" onClick={handleRedirect} key="login">
            Go to Login
          </Button>,
        ]}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f7fb",
    padding: "20px",
  },
};
