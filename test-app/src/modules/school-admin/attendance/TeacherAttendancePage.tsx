"use client";

import { ReloadOutlined, CarryOutOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Row, Statistic, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { useGetTeacherAttendanceHistoryQuery } from "./attendance.api";
import styles from "./AttendancePage.module.css";

const { Title, Paragraph, Text } = Typography;

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } =
    useGetTeacherAttendanceHistoryQuery({
      page,
      limit,
    });

  const items = data?.data ?? [];
  const meta = data?.meta;

  const checkedInCount = items.filter((item) => item.checkInAt).length;
  const checkedOutCount = items.filter((item) => item.checkOutAt).length;
  const leaveCount = items.filter(
    (item) => String(item.status).toUpperCase() === "LEAVE",
  ).length;

  const rows = useMemo(
    () =>
      items.map((item, index) => ({
        key: item._id,
        index: index + 1,
        name: `${item.teacherId?.firstName || "Teacher"} ${item.teacherId?.lastName || ""}`.trim(),
        employeeId: item.teacherId?.employeeId || "N/A",
        phone: item.teacherId?.phone || "",
        date: item.date,
        checkInAt: item.checkInAt,
        checkOutAt: item.checkOutAt,
        status: String(item.status || "").toUpperCase(),
        note: item.note || "",
      })),
    [items],
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Teacher attendance
          </Title>
          <Paragraph className={styles.subtitle}>
            View teacher check-in, check-out, leave, and half-day records with
            pagination only.
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
            <Statistic title="Check-ins" value={checkedInCount} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className={styles.metricCard}>
            <Statistic title="Check-outs" value={checkedOutCount} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" className={styles.metricCard}>
            <Statistic title="Leave" value={leaveCount} />
          </Card>
        </Col>
      </Row>

      <div className={styles.helperRow}>
        <Tag color="gold">
          <CarryOutOutlined /> Teacher attendance history
        </Tag>
        <Text type="secondary">
          Backend-backed teacher records with page-based navigation.
        </Text>
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
              title: "Teacher",
              dataIndex: "name",
              render: (value: string, record: any) => (
                <div>
                  <strong>{value}</strong>
                  <div>
                    <Text type="secondary">
                      Emp #{record.employeeId || "N/A"}
                    </Text>
                  </div>
                </div>
              ),
            },
            { title: "Phone", dataIndex: "phone" },
            { title: "Date", dataIndex: "date" },
            {
              title: "Check-in",
              dataIndex: "checkInAt",
              render: (value: string) => value || "-",
            },
            {
              title: "Check-out",
              dataIndex: "checkOutAt",
              render: (value: string) => value || "-",
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (value: string) => (
                <Tag
                  color={
                    value.includes("CHECKED_OUT") || value.includes("PRESENT")
                      ? "green"
                      : value.includes("LEAVE")
                        ? "orange"
                        : value.includes("LATE")
                          ? "gold"
                          : "blue"
                  }
                >
                  {value}
                </Tag>
              ),
            },
            {
              title: "Note",
              dataIndex: "note",
              render: (value: string) => value || "-",
            },
          ]}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No teacher attendance records found"
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
