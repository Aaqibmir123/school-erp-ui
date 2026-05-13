"use client";

import { useEffect, useState } from "react";

import LoginEntry from "@/src/modules/auth/components/LoginEntry";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main
        aria-label="Loading school ERP login"
        style={{
          minHeight: "100vh",
          background: "var(--color-background)",
        }}
      />
    );
  }

  return <LoginEntry />;
}
