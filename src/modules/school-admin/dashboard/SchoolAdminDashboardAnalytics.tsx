"use client";

import type { ReactNode } from "react";
import { memo, useMemo } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, Col, Empty, Row, Space, Table, Tag, Typography } from "antd";

import { useGetAdminDashboardSummaryQuery } from "./dashboard.api";
import { WEB_THEME } from "@/src/theme/tokens";
import type { TransportRecord } from "@/shared-types/transport.types";
import styles from "./SchoolAdminDashboard.module.css";

const { Text } = Typography;

const COLORS = [
  WEB_THEME.colors.primary,
  "#0F172A",
  "#16A34A",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

const ChartCard = memo(function ChartCard({
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

  const hasFeeTrend = feeTrend.some((item) => item.collected > 0 || item.due > 0);
  const hasRevenueMix = revenueMix.some((item) => item.value > 0);
  const hasTransport = transportBreakdown.some((item) => item.value > 0);

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
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <ChartCard title="Fee collection">
            {hasFeeTrend ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={feeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke={WEB_THEME.colors.primary}
                    fill={WEB_THEME.colors.primarySoft}
                    strokeWidth={3}
                    name="Collected"
                  />
                  <Area
                    type="monotone"
                    dataKey="due"
                    stroke="#EF4444"
                    fill="#FEE2E2"
                    strokeWidth={3}
                    name="Due"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No fee trend data yet" />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={10}>
          <ChartCard title="Revenue mix">
            {hasRevenueMix ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={revenueMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={70}
                    paddingAngle={4}
                  >
                    {revenueMix.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No financial breakdown yet" />
            )}
          </ChartCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <ChartCard title="Transport salaries">
            {hasTransport ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={transportBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                    {transportBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="No transport records yet" />
            )}
          </ChartCard>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            variant="borderless"
            title="Recent transport records"
            className={styles.tableCard}
          >
            <Table
              rowKey="_id"
              size="small"
              pagination={false}
              dataSource={transportRows}
              columns={[
                {
                  title: "Route",
                  dataIndex: "routeName",
                  render: (_: string, record: TransportRecord) => (
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
                  render: (_: string, record: TransportRecord) => (
                    <div>
                      <div>{record.driverName}</div>
                      <Text type="secondary">{record.driverPhone}</Text>
                    </div>
                  ),
                },
                {
                  title: "Salary",
                  dataIndex: "driverSalary",
                  render: (_: number, record: TransportRecord) => (
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
                  render: (_: string, record: TransportRecord) => (
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
              ]}
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
              }}
            />
          </Card>
        </Col>
      </Row>

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
    </>
  );
}

export default memo(SchoolAdminDashboardAnalytics);
