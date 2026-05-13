"use client";

import type { ReactNode } from "react";
import { memo, useCallback, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

import {
  CarryOutOutlined,
  CarOutlined,
  DollarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";

import { useGetAdminDashboardOverviewQuery } from "./dashboard.api";
import { WEB_THEME } from "@/src/theme/tokens";
import styles from "./SchoolAdminDashboard.module.css";

const { Title, Paragraph, Text } = Typography;

const DashboardAnalytics = dynamic(() => import("./SchoolAdminDashboardAnalytics"), {
  loading: () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={14}>
        <Card variant="borderless" className={styles.sectionCard}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
      <Col xs={24} xl={10}>
        <Card variant="borderless" className={styles.sectionCard}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Col>
    </Row>
  ),
  ssr: false,
});

type MetricCardProps = {
  title: string;
  value: string | number;
  helper: string;
  icon: ReactNode;
  tone?: string;
};

const MetricCard = memo(function MetricCard({
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
            <Statistic value={value} styles={{ content: { fontSize: 26, lineHeight: 1.2 } }} />
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {helper}
          </Text>
        </div>
      </Space>
    </Card>
  );
});

const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBadge}>School overview</div>
        <Title level={2} className={styles.heroTitle}>
          School Admin Dashboard
        </Title>
        <Paragraph className={styles.heroText}>
          Live school operations, fee collection, transport status, and counts.
        </Paragraph>
      </div>

      <Card variant="borderless" className={styles.attendanceCard}>
        <Space align="start" size={16} className={styles.attendanceWrap}>
          <div className={styles.attendanceTone}>
            <CarryOutOutlined />
          </div>
          <div className={styles.attendanceMeta}>
            <Text strong>Attendance records</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">Loading summary...</Text>
            </div>
          </div>
        </Space>
        <div className={styles.attendanceActionWrap}>
          <Button type="primary" className={styles.attendanceAction} loading>
            Open attendance
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((index) => (
          <Col xs={24} sm={12} xl={6} key={index}>
            <Card variant="borderless" className={styles.metricCard}>
              <Skeleton active title={false} paragraph={{ rows: 2 }} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card variant="borderless" className={styles.sectionCard}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default function SchoolAdminDashboard() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isFetching } = useGetAdminDashboardOverviewQuery();

  const refreshDashboard = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
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
  }, [refreshDashboard]);

  const attendanceCopy = useMemo(
    () => ({
      title: "Attendance records",
      helper: "Open class attendance filters, date ranges, and records.",
    }),
    [],
  );

  if (isLoading && !data) {
    return <DashboardSkeleton />;
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
      <div className={styles.hero}>
        <div className={styles.heroBadge}>School overview</div>
        <Title level={2} className={styles.heroTitle}>
          School Admin Dashboard
        </Title>
        <Paragraph className={styles.heroText}>
          Live school operations, fee collection, transport status, and counts.
        </Paragraph>
      </div>

      <Card variant="borderless" className={styles.attendanceCard}>
        <Space align="start" size={16} className={styles.attendanceWrap}>
          <div className={styles.attendanceTone}>
            <CarryOutOutlined />
          </div>
          <div className={styles.attendanceMeta}>
            <Text strong>{attendanceCopy.title}</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">{attendanceCopy.helper}</Text>
            </div>
          </div>
        </Space>
        <div className={styles.attendanceActionWrap}>
          <Button
            type="primary"
            className={styles.attendanceAction}
            onClick={() => router.push("/school-admin/attendance")}
            loading={isFetching && !data}
          >
            Open attendance
          </Button>
        </div>
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

      <DashboardAnalytics />
    </div>
  );
}
