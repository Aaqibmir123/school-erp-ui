"use client";

import { ReloadOutlined } from "@ant-design/icons";
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
import { useGetClassesQuery } from "../classes/classes";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import { useGetAttendanceHistoryQuery } from "./attendance.api";
import styles from "./AttendancePage.module.css";

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

export default function StudentAttendancePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [classId, setClassId] = useState<string>();
  const [sectionId, setSectionId] = useState<string>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>();
  const [dateRange, setDateRange] = useState<any>(null);
  const limit = 20;

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsByClassQuery(classId || "", {
    skip: !classId,
  });

  const { data, isLoading, isFetching, refetch } = useGetAttendanceHistoryQuery({
    classId,
    sectionId,
    search: search || undefined,
    from: dateRange?.[0] ? dayjs(dateRange[0]).format("YYYY-MM-DD") : undefined,
    to: dateRange?.[1] ? dayjs(dateRange[1]).format("YYYY-MM-DD") : undefined,
    page,
    limit,
  });

  const serverItems = data?.data ?? [];
  const filteredItems = useMemo(() => {
    if (!statusFilter) return serverItems;
    return serverItems.filter((item) =>
      String(item.status || "").toUpperCase().includes(statusFilter.toUpperCase()),
    );
  }, [serverItems, statusFilter]);

  const meta = data?.meta;
  const presentCount = filteredItems.filter((item) =>
    String(item.status).toUpperCase().includes("PRESENT"),
  ).length;
  const absentCount = filteredItems.filter((item) =>
    String(item.status).toUpperCase().includes("ABSENT"),
  ).length;

  const rows = useMemo(
    () =>
      filteredItems.map((item, index) => ({
        key: item._id,
        index: (page - 1) * limit + index + 1,
        name: `${item.studentId?.firstName || "Student"} ${item.studentId?.lastName || ""}`.trim(),
        rollNumber: item.studentId?.rollNumber || "N/A",
        subjectName: item.subjectId?.name || "Subject",
        period: `${item.periodId?.startTime || "--:--"} - ${item.periodId?.endTime || "--:--"}`,
        date: item.date,
        mode: String(item.mode || "AUTO").toUpperCase(),
        status: String(item.status || "").toUpperCase(),
        reason: item.reason || "",
      })),
    [filteredItems, page],
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Student Attendance
          </Title>
          <Paragraph className={styles.subtitle}>
            Review attendance by class, section, date range, status, and student search.
          </Paragraph>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Select class"
            value={classId}
            style={{ width: "100%" }}
            options={classes.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value) => {
              setClassId(value);
              setSectionId(undefined);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Select section"
            disabled={!classId}
            value={sectionId}
            style={{ width: "100%" }}
            options={sections.map((item) => ({
              label: item.name,
              value: item._id,
            }))}
            onChange={(value) => {
              setSectionId(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Select
            allowClear
            placeholder="Filter status"
            value={statusFilter}
            style={{ width: "100%" }}
            options={[
              { label: "Present", value: "PRESENT" },
              { label: "Absent", value: "ABSENT" },
              { label: "Late", value: "LATE" },
            ]}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          />
        </Col>
        <Col xs={24} md={6}>
          <Input.Search
            allowClear
            placeholder="Search student or roll number"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
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
            <Statistic title="Records" value={filteredItems.length} />
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
        <Tag color="blue">Student attendance records</Tag>
        <Text type="secondary">Use filters to narrow the list for office review.</Text>
      </div>

      <Card variant="borderless" className={styles.tableCard}>
        <ResponsiveTable
          rowKey="key"
          loading={isLoading || isFetching}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize: limit,
            total: meta?.total || filteredItems.length,
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
                description="No attendance records match the current filters"
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
