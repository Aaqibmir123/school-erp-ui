"use client";

import type { ReactNode } from "react";
import { memo, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import dynamic from "next/dynamic";
import { Card, Col, Empty, Row, Space, Table, Tag, Typography } from "antd";

import { useGetAdminDashboardSummaryQuery } from "./dashboard.api";
import type { TransportRecord } from "@/shared-types/transport.types";
import styles from "./SchoolAdminDashboard.module.css";
import DashboardChartsBlockSkeleton from "./DashboardChartsBlockSkeleton";

const { Text } = Typography;

const DashboardRechartsChartsLazy = dynamic(
  () => import("./DashboardRechartsCharts"),
  {
    ssr: false,
    loading: () => <DashboardChartsBlockSkeleton />,
  },
);

type TransportRow = TransportRecord & { salaryLabel: string };

const TransportRecordsTable = memo(function TransportRecordsTable({
  rows,
  columns,
  locale,
}: {
  rows: TransportRow[];
  columns: ColumnsType<TransportRow>;
  locale: { emptyText: ReactNode };
}) {
  return (
    <Table<TransportRow>
      rowKey="_id"
      size="small"
      pagination={false}
      dataSource={rows}
      columns={columns}
      locale={locale}
    />
  );
});

const DashboardSummaryStatCards = memo(function DashboardSummaryStatCards({
  counts,
  finance,
}: {
  counts: { classes: number; sections: number; subjects: number };
  finance: {
    teacherPayrollEstimate: number;
    transportSalaryPaid: number;
    transportSalaryDue: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
  };
}) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} xl={8}>
        <Card variant="borderless" className={styles.sectionCard}>
          <Space align="center" className={styles.sectionStack}>
            <Text strong>Academic structure</Text>
          </Space>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Classes: {counts.classes}</Text>
            <Text>Sections: {counts.sections}</Text>
            <Text>Subjects: {counts.subjects}</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card variant="borderless" className={styles.sectionCard}>
          <Space align="center" className={styles.sectionStack}>
            <Text strong>Budget planning</Text>
          </Space>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>
              Teacher payroll estimate: Rs. {finance.teacherPayrollEstimate.toLocaleString()}
            </Text>
            <Text>
              Transport salary paid: Rs. {finance.transportSalaryPaid.toLocaleString()}
            </Text>
            <Text>
              Transport salary due: Rs. {finance.transportSalaryDue.toLocaleString()}
            </Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card variant="borderless" className={styles.sectionCard}>
          <Space align="center" className={styles.sectionStack}>
            <Text strong>Fee status split</Text>
          </Space>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Text>Paid receipts: {finance.paidCount}</Text>
            <Text>Partial dues: {finance.partialCount}</Text>
            <Text>Unpaid dues: {finance.unpaidCount}</Text>
          </div>
        </Card>
      </Col>
    </Row>
  );
});

function SchoolAdminDashboardAnalytics() {
  const { data, isLoading } = useGetAdminDashboardSummaryQuery();

  const feeTrend = data?.charts.monthlyFeeTrend ?? [];
  const counts = data?.counts ?? { classes: 0, sections: 0, subjects: 0 };
  const finance = data?.finance ?? {
    teacherPayrollEstimate: 0,
    transportSalaryPaid: 0,
    transportSalaryDue: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0,
  };
  const recentTransports = data?.recentTransports;
  const revenueMix = data?.charts.revenueMix ?? [];
  const transportBreakdown = data?.charts.transportStatusBreakdown ?? [];

  const transportRows = useMemo(
    () =>
      (recentTransports ?? []).map((item) => ({
        ...item,
        salaryLabel:
          item.salaryStatus.charAt(0).toUpperCase() + item.salaryStatus.slice(1),
      })),
    [recentTransports],
  );

  const transportColumns = useMemo<ColumnsType<TransportRow>>(
    () => [
      {
        title: "Route",
        dataIndex: "routeName",
        render: (_: string, record: TransportRow) => (
          <div>
            <strong>{record.routeName}</strong>
            <div>
              <Text type="secondary">{record.vehicleNumber}</Text>
            </div>
          </div>
        ),
      },
      {
        title: "Driver",
        dataIndex: "driverName",
        render: (_: string, record: TransportRow) => (
          <div>
            <div>{record.driverName}</div>
            <Text type="secondary">{record.driverPhone}</Text>
          </div>
        ),
      },
      {
        title: "Salary",
        dataIndex: "driverSalary",
        render: (_: number, record: TransportRow) => (
          <div>
            <div>Rs. {Number(record.driverSalary || 0).toLocaleString()}</div>
            <Text type="secondary">
              Due Rs. {Number(record.salaryDueAmount || 0).toLocaleString()}
            </Text>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "salaryStatus",
        render: (_: string, record: TransportRow) => (
          <Tag
            color={
              record.salaryStatus === "paid"
                ? "green"
                : record.salaryStatus === "partial"
                  ? "gold"
                  : "red"
            }
          >
            {record.salaryStatus}
          </Tag>
        ),
      },
    ],
    [],
  );

  const transportTableLocale = useMemo(
    () => ({
      emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
    }),
    [],
  );

  const transportTable = useMemo(
    () => (
      <TransportRecordsTable
        rows={transportRows}
        columns={transportColumns}
        locale={transportTableLocale}
      />
    ),
    [transportRows, transportColumns, transportTableLocale],
  );

  const hasFeeTrend = useMemo(
    () => feeTrend.some((item) => item.collected > 0 || item.due > 0),
    [feeTrend],
  );
  const hasRevenueMix = useMemo(
    () => revenueMix.some((item) => item.value > 0),
    [revenueMix],
  );
  const hasTransport = useMemo(
    () => transportBreakdown.some((item) => item.value > 0),
    [transportBreakdown],
  );

  const rechartsBlockProps = useMemo(
    () => ({
      feeTrend,
      revenueMix,
      transportBreakdown,
      hasFeeTrend,
      hasRevenueMix,
      hasTransport,
      transportTable,
    }),
    [
      feeTrend,
      revenueMix,
      transportBreakdown,
      hasFeeTrend,
      hasRevenueMix,
      hasTransport,
      transportTable,
    ],
  );

  if (isLoading && !data) {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Empty description="Loading dashboard analytics..." />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Empty description="Loading dashboard analytics..." />
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <DashboardRechartsChartsLazy {...rechartsBlockProps} />

      <DashboardSummaryStatCards counts={counts} finance={finance} />
    </>
  );
}

export default memo(SchoolAdminDashboardAnalytics);
