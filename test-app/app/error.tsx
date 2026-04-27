"use client";

import { Button, Result, Typography } from "antd";
import { useEffect, useState } from "react";

const { Paragraph, Text } = Typography;
const LAST_CRASH_KEY = "school-erp:last-crash";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App crash captured:", error);
  }, [error]);

  const [lastCrash, setLastCrash] = useState<unknown>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(LAST_CRASH_KEY);
      setLastCrash(raw ? JSON.parse(raw) : null);
    } catch {
      setLastCrash(null);
    }
  }, []);

  const copyError = async () => {
    const payload = [
      `message: ${error.message}`,
      error.digest ? `digest: ${error.digest}` : null,
      error.stack ? `stack: ${error.stack}` : null,
      typeof window !== "undefined" ? `path: ${window.location.pathname}` : null,
      lastCrash ? `lastCrash: ${JSON.stringify(lastCrash)}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      console.warn("Clipboard copy failed");
    }
  };

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Result
        status="error"
        title="Something broke on this screen"
        subTitle="The app caught a runtime error. Retry once, and if it keeps happening we can trace it from the stack below."
        extra={[
          <Button key="retry" type="primary" onClick={reset}>
            Retry
          </Button>,
          <Button key="copy" onClick={() => void copyError()}>
            Copy details
          </Button>,
          <Button key="home" onClick={() => window.location.assign("/")}>
            Go Home
          </Button>,
        ]}
      >
        <div style={{ textAlign: "left", maxWidth: 760, margin: "0 auto" }}>
          <Paragraph>
            <Text strong>Error:</Text> {error.message}
          </Paragraph>
          {error.stack && (
            <Paragraph>
              <Text strong>Stack:</Text> {error.stack}
            </Paragraph>
          )}
          {error.digest && (
            <Paragraph>
              <Text strong>Digest:</Text> {error.digest}
            </Paragraph>
          )}
          {lastCrash && (
            <Paragraph>
              <Text strong>Last captured crash:</Text>{" "}
              {JSON.stringify(lastCrash)}
            </Paragraph>
          )}
          <Paragraph type="secondary">
            If this repeats, check the browser console or the server logs for the
            exact component path and request that triggered it.
          </Paragraph>
        </div>
      </Result>
    </main>
  );
}
