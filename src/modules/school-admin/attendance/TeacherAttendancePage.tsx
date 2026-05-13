"use client";

import { CarryOutOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Row,
  Select,
  Statistic,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { useGetTeacherAttendanceHistoryQuery } from "./attendance.api";
import styles from "./AttendancePage.module.css";

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>();
  const [dateRange, setDateRange] = useState<any>(null);
  const limit = 20;

  const { data, isLoading, isFetching, refetch } =
    useGetTeacherAttendanceHistoryQuery({
      search: search || undefined,
      status,
      from: dateRange?.[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : undefined,
      to: dateRange?.[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : undefined,
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
        index: (page - 1) * limit + index + 1,
        name: `${item.teacherId?.firstName || "Teacher"} ${item.teacherId?.lastName || ""}`.trim(),
        employeeId: item.teacherId?.employeeId || "N/A",
        phone: item.teacherId?.phone || "",
        date: item.date,
        checkInAt: item.checkInAt,
        checkOutAt: item.checkOutAt,
        status: String(item.status || "").toUpperCase(),
        note: item.note || "",
      })),
    [items, page],
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Teacher Attendance
          </Title>
          <Paragraph className={styles.subtitle}>
            Review teacher check-in, check-out, leave, and half-day records with
            filters for search, status, and date.
          </Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Input.Search
            allowClear
            placeholder="Search teacher name, phone, or employee ID"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            allowClear
            placeholder="Filter status"
            value={status}
            style={{ width: "100%" }}
            options={[
              { label: "Present", value: "PRESENT" },
              { label: "Checked Out", value: "CHECKED_OUT" },
              { label: "Late", value: "LATE" },
              { label: "Leave", value: "LEAVE" },
            ]}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={8}>
          <RangePicker
            style={{ width: "100%" }}
            value={dateRange}
            onChange={(value) => {
              setDateRange(value);
              setPage(1);
            }}
          />
        </Col>
      </Row>

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
          Use filters to review attendance exceptions before taking action.
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
                    <Text type="secondary">Emp #{record.employeeId || "N/A"}</Text>
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
                description="No teacher attendance records match the current filters"
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
