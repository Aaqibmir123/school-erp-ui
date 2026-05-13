"use client";

import { memo } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/src/store/store";

import BrandLoader from "./BrandLoader";
import styles from "./GlobalLoader.module.css";

function GlobalLoader() {
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

export default memo(GlobalLoader);
