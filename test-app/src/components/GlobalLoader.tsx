"use client";

import { useSelector } from "react-redux";

import type { RootState } from "@/src/store/store";

import BrandLoader from "./BrandLoader";
import styles from "./GlobalLoader.module.css";

export default function GlobalLoader() {
  const loading = useSelector((state: RootState) => state.ui.loading);

  if (!loading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <BrandLoader />
      </div>
    </div>
  );
}
