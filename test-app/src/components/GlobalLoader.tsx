"use client";

import { Spin } from "antd";
import { useSelector } from "react-redux";

import type { RootState } from "@/src/store/store";

import styles from "./GlobalLoader.module.css";

export default function GlobalLoader() {
  const loading = useSelector((state: RootState) => state.ui.loading);

  if (!loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <Spin size="large" />
        <p className={styles.text}>Loading workspace...</p>
      </div>
    </div>
  );
}
