"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Statistic, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { useGetAttendanceHistoryQuery } from "./attendance.api";
import styles from "./AttendancePage.module.css";

const { Title, Paragraph, Text } = Typography;

export default function StudentAttendancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } = useGetAttendanceHistoryQuery(
    { page, limit },
  );

  const items = data?.data ?? [];
  const meta = data?.meta;

  const presentCount = items.filter((item) =>
    String(item.status).toUpperCase().includes("PRESENT"),
  ).length;
  const absentCount = items.filter((item) =>
    String(item.status).toUpperCase().includes("ABSENT"),
  ).length;

  const rows = useMemo(
    () =>
      items.map((item, index) => ({
        key: item._id,
        index: index + 1,
        name: `${item.studentId?.firstName || "Student"} ${item.studentId?.lastName || ""}`.trim(),
        rollNumber: item.studentId?.rollNumber || "N/A",
        subjectName: item.subjectId?.name || "Subject",
        period: `${item.periodId?.startTime || "--:--"} - ${item.periodId?.endTime || "--:--"}`,
        date: item.date,
        mode: String(item.mode || "AUTO").toUpperCase(),
        status: String(item.status || "").toUpperCase(),
        reason: item.reason || "",
      })),
    [items],
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Student attendance
          </Title>
          <Paragraph className={styles.subtitle}>
            View student attendance records by page. No filters, just fast
            pagination.
          </Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className={styles.metricCard}>
            <Statistic title="Records" value={items.length} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className={styles.metricCard}>
            <Statistic title="Present" value={presentCount} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className={styles.metricCard}>
            <Statistic title="Absent" value={absentCount} />
          </Card>
        </Col>
      </Row>

      <div className={styles.helperRow}>
        <Tag color="blue">Student attendance history</Tag>
        <Text type="secondary">Backend-backed attendance with pagination.</Text>
      </div>

      <Card variant="borderless" className={styles.tableCard}>
        <ResponsiveTable
          rowKey="key"
          loading={isLoading || isFetching}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize: limit,
            total: meta?.total || items.length,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: (nextPage: number) => setPage(nextPage),
          }}
          columns={[
            { title: "#", dataIndex: "index", width: 70 },
            {
              title: "Student",
              dataIndex: "name",
              render: (value: string, record: any) => (
                <div>
                  <strong>{value}</strong>
                  <div>
                    <Text type="secondary">Roll #{record.rollNumber}</Text>
                  </div>
                </div>
              ),
            },
            { title: "Subject", dataIndex: "subjectName" },
            { title: "Period", dataIndex: "period" },
            { title: "Date", dataIndex: "date" },
            {
              title: "Mode",
              dataIndex: "mode",
              render: (value: string) => <Tag color="blue">{value}</Tag>,
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (value: string) => (
                <Tag
                  color={
                    value.includes("PRESENT")
                      ? "green"
                      : value.includes("ABSENT")
                        ? "red"
                        : "gold"
                  }
                >
                  {value}
                </Tag>
              ),
            },
            {
              title: "Reason",
              dataIndex: "reason",
              render: (value: string) => value || "-",
            },
          ]}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No student attendance records found"
              />
            ),
          }}
        />

        {meta ? (
          <div className={styles.footer}>
            <Text type="secondary">
              Page {meta.page} of {meta.totalPages} - {meta.total} records
            </Text>
          </div>
        ) : null}
      </Card>

      <Button onClick={() => router.push("/school-admin/attendance")}>
        Back to attendance hub
      </Button>
    </div>
  );
}
