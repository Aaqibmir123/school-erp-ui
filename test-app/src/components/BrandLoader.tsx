"use client";

import styles from "./BrandLoader.module.css";

type BrandLoaderProps = {
  compact?: boolean;
};

export default function BrandLoader({ compact = false }: BrandLoaderProps) {
  return (
    <div
      className={compact ? styles.compactWrap : styles.wrap}
      aria-label="Loading"
      role="status"
    >
      <div className={styles.ring}>
        <span className={styles.dot} />
        <span className={`${styles.dot} ${styles.dotDelay1}`} />
        <span className={`${styles.dot} ${styles.dotDelay2}`} />
      </div>
    </div>
  );
}
