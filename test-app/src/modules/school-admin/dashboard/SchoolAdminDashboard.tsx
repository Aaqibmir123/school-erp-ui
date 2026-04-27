"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import {
  ApartmentOutlined,
  CarOutlined,
  DollarOutlined,
  FallOutlined,
  CarryOutOutlined,
  RiseOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";

import { useGetAdminDashboardSummaryQuery } from "./dashboard.api";
import { WEB_THEME } from "@/src/theme/tokens";
import type { TransportRecord } from "@/shared-types/transport.types";
import styles from "./SchoolAdminDashboard.module.css";

const { Title, Paragraph, Text } = Typography;

const COLORS = [
  WEB_THEME.colors.primary,
  "#0F172A",
  "#16A34A",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

type MetricCardProps = {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  tone?: string;
};

function MetricCard({
  title,
  value,
  helper,
  icon,
  tone = WEB_THEME.colors.primary,
}: MetricCardProps) {
  return (
    <Card variant="borderless" className={styles.metricCard}>
      <Space align="start" size={16}>
        <div
          className={styles.metricTone}
          style={{
            background: `${tone}14`,
            color: tone,
          }}
        >
          {icon}
        </div>

        <div className={styles.metricMeta}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {title}
          </Text>
          <div style={{ marginTop: 4 }}>
            <Statistic
              value={value}
              styles={{ content: { fontSize: 26, lineHeight: 1.2 } }}
            />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {helper}
          </Text>
        </div>
      </Space>
    </Card>
  );
}

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useGetAdminDashboardSummaryQuery();

  useEffect(() => {
    const refreshDashboard = () => {
      refetch();
    };

    window.addEventListener("dashboard-updated", refreshDashboard);
    window.addEventListener("students-updated", refreshDashboard);
    window.addEventListener("fees-updated", refreshDashboard);
    window.addEventListener("transport-updated", refreshDashboard);

    return () => {
      window.removeEventListener("dashboard-updated", refreshDashboard);
      window.removeEventListener("students-updated", refreshDashboard);
      window.removeEventListener("fees-updated", refreshDashboard);
      window.removeEventListener("transport-updated", refreshDashboard);
    };
  }, [refetch]);

  const feeTrend = data?.charts.monthlyFeeTrend ?? [];
  const transportBreakdown = data?.charts.transportStatusBreakdown ?? [];
  const revenueMix = data?.charts.revenueMix ?? [];
  const recentTransports = data?.recentTransports;

  const transportRows = useMemo(
    () =>
      (recentTransports ?? []).map((item) => ({
        ...item,
        salaryLabel:
          item.salaryStatus.charAt(0).toUpperCase() + item.salaryStatus.slice(1),
      })),
    [recentTransports],
  );

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  if (error || !data) {
    return (
      <Card variant="borderless" className={styles.sectionCard}>
        <Empty
          description="Dashboard summary is not available right now"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <Title level={2} className={styles.introTitle}>
          School Admin Dashboard
        </Title>
        <Paragraph className={styles.introText}>
          Live school overview with fee collection, teacher budget estimates,
          transport status, and operational counts pulled from the backend.
        </Paragraph>
      </div>

      <Card variant="borderless" className={styles.attendanceCard}>
        <Space align="start" size={16} className={styles.attendanceWrap}>
          <div className={styles.attendanceTone}>
            <CarryOutOutlined />
          </div>
          <div className={styles.attendanceMeta}>
            <Text strong>Attendance full view</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                Inspect class attendance records, date ranges, and filters from
                one responsive page.
              </Text>
            </div>
          </div>
        </Space>
        <Button
          type="primary"
          onClick={() => router.push("/school-admin/attendance")}
        >
          Open attendance
        </Button>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Students"
            value={data.counts.students}
            helper="Total active students in the school"
            icon={<TeamOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Teachers"
            value={data.counts.teachers}
            helper="Faculty members currently on record"
            icon={<UserOutlined />}
            tone="#16A34A"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Fee Collected"
            value={`Rs. ${data.finance.collected.toLocaleString()}`}
            helper={`Rs. ${data.finance.due.toLocaleString()} pending`}
            icon={<DollarOutlined />}
            tone="#F59E0B"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <MetricCard
            title="Transport Fleet"
            value={data.counts.transports}
            helper={`${data.counts.activeTransports} active routes`}
            icon={<CarOutlined />}
            tone="#06B6D4"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            variant="borderless"
            title="Monthly fee collection"
            className={styles.sectionCard}
          >
            {feeTrend.some((item) => item.collected > 0 || item.due > 0) ? (
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
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            variant="borderless"
            title="Revenue mix"
            className={styles.sectionCard}
          >
            {revenueMix.some((item) => item.value > 0) ? (
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
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <Card
            variant="borderless"
            title="Transport salary status"
            className={styles.sectionCard}
          >
            {transportBreakdown.some((item) => item.value > 0) ? (
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
          </Card>
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
              <ApartmentOutlined />
              <Text strong>Academic structure</Text>
            </Space>
            <Space orientation="vertical" size={8}>
              <Text>Classes: {data.counts.classes}</Text>
              <Text>Sections: {data.counts.sections}</Text>
              <Text>Subjects: {data.counts.subjects}</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Space align="center" className={styles.sectionStack}>
              <RiseOutlined />
              <Text strong>Budget planning</Text>
            </Space>
            <Space orientation="vertical" size={8}>
              <Text>
                Teacher payroll estimate: Rs.{" "}
                {data.finance.teacherPayrollEstimate.toLocaleString()}
              </Text>
              <Text>
                Transport salary paid: Rs.{" "}
                {data.finance.transportSalaryPaid.toLocaleString()}
              </Text>
              <Text>
                Transport salary due: Rs.{" "}
                {data.finance.transportSalaryDue.toLocaleString()}
              </Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Space align="center" className={styles.sectionStack}>
              <FallOutlined />
              <Text strong>Fee status split</Text>
            </Space>
            <Space orientation="vertical" size={8}>
              <Text>Paid receipts: {data.finance.paidCount}</Text>
              <Text>Partial dues: {data.finance.partialCount}</Text>
              <Text>Unpaid dues: {data.finance.unpaidCount}</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
