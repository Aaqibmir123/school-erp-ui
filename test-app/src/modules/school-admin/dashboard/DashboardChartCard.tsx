"use client";

import type { ReactNode } from "react";
import { memo } from "react";
import { Card } from "antd";

import styles from "./SchoolAdminDashboard.module.css";

const DashboardChartCard = memo(function DashboardChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card variant="borderless" title={title} className={styles.sectionCard}>
      {children}
    </Card>
  );
});

export default DashboardChartCard;
