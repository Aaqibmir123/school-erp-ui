"use client";

import { Card, Col, Row, Skeleton } from "antd";

import styles from "./SchoolAdminDashboard.module.css";

/** Matches chart + transport table block layout to limit CLS while chunks load. */
export default function DashboardChartsBlockSkeleton() {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Skeleton active title paragraph={{ rows: 10 }} />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Skeleton active title paragraph={{ rows: 10 }} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Skeleton active title paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card variant="borderless" className={styles.tableCard}>
            <Skeleton active title={false} paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
