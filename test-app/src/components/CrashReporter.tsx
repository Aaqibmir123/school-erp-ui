"use client";

import { useEffect } from "react";

const LAST_CRASH_KEY = "school-erp:last-crash";

const captureCrash = (kind: string, payload: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  const record = {
    ...payload,
    kind,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  try {
    sessionStorage.setItem(LAST_CRASH_KEY, JSON.stringify(record));
  } catch {
    // Best effort only.
  }
};

export const getLastCapturedCrash = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(LAST_CRASH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function CrashReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      console.error("Global error event captured:", event.error || event.message);

      captureCrash("error", {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack || null,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled rejection captured:", event.reason);

      captureCrash("unhandledrejection", {
        message:
          event.reason instanceof Error
            ? event.reason.message
            : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack || null : null,
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
