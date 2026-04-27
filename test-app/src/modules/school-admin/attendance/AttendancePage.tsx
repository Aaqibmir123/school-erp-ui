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
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { getClassesApi } from "../classes/api/class.api";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import {
  useGetAttendanceHistoryQuery,
  useGetTeacherAttendanceHistoryQuery,
} from "./attendance.api";
import styles from "./AttendancePage.module.css";

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;

type FilterDate = [Dayjs | null, Dayjs | null] | null;

export default function AttendancePage() {
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherStatus, setTeacherStatus] = useState<string>("");
  const [teacherDateRange, setTeacherDateRange] = useState<FilterDate>(null);
  const [teacherPage, setTeacherPage] = useState(1);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [dateRange, setDateRange] = useState<FilterDate>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [classes, setClasses] = useState<{ label: string; value: string }[]>(
    [],
  );

  useEffect(() => {
    void (async () => {
      try {
        const data = await getClassesApi();
        setClasses(
          data.map((item) => ({
            label: item.name,
            value: item._id,
          })),
        );
      } catch {
        setClasses([]);
      }
    })();
  }, []);

  const { data: sections = [] } = useGetSectionsByClassQuery(
    selectedClassId || "",
    { skip: !selectedClassId },
  );

  const { data, isLoading, isFetching, refetch } = useGetAttendanceHistoryQuery(
    {
      classId: selectedClassId || undefined,
      sectionId: selectedSectionId || undefined,
      mode: mode || undefined,
      search: search.trim() || undefined,
      from: dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
      to: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
      page,
      limit,
    },
  );

  const {
    data: teacherData,
    isLoading: teacherLoading,
    isFetching: teacherFetching,
    refetch: refetchTeacher,
  } = useGetTeacherAttendanceHistoryQuery({
    search: teacherSearch.trim() || undefined,
    status: teacherStatus || undefined,
    from: teacherDateRange?.[0]
      ? teacherDateRange[0].format("YYYY-MM-DD")
      : undefined,
    to: teacherDateRange?.[1]
      ? teacherDateRange[1].format("YYYY-MM-DD")
      : undefined,
    page: teacherPage,
    limit,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;
  const presentCount = items.filter((item) =>
    String(item.status).toUpperCase().includes("PRESENT"),
  ).length;
  const absentCount = items.filter((item) =>
    String(item.status).toUpperCase().includes("ABSENT"),
  ).length;

  useEffect(() => {
    setPage(1);
  }, [search, mode, selectedClassId, selectedSectionId, dateRange]);

  useEffect(() => {
    setTeacherPage(1);
  }, [teacherSearch, teacherStatus, teacherDateRange]);

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

  const teacherItems = teacherData?.data ?? [];
  const teacherMeta = teacherData?.meta;
  const teacherRows = useMemo(
    () =>
      teacherItems.map((item, index) => ({
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
    [teacherItems],
  );

  const teacherCheckedInCount = teacherItems.filter((item) => item.checkInAt)
    .length;
  const teacherCheckedOutCount = teacherItems.filter((item) => item.checkOutAt)
    .length;
  const teacherLeaveCount = teacherItems.filter(
    (item) => String(item.status).toUpperCase() === "LEAVE",
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Attendance Overview
          </Title>
          <Paragraph className={styles.subtitle}>
            Search class attendance, inspect date ranges, and open the full
            school attendance view from one responsive page.
          </Paragraph>
        </div>

        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Space>
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

      <Card variant="borderless" className={styles.filterCard}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={8}>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, roll number..."
              allowClear
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              value={selectedClassId || undefined}
              onChange={(value) => {
                setSelectedClassId(value);
                setSelectedSectionId("");
              }}
              placeholder="Select class"
              options={classes}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              value={selectedSectionId || undefined}
              onChange={setSelectedSectionId}
              placeholder="Select section"
              options={sections.map((section) => ({
                label: section.name,
                value: section._id,
              }))}
              allowClear
              style={{ width: "100%" }}
              disabled={!selectedClassId}
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              value={mode || undefined}
              onChange={setMode}
              placeholder="Mode"
              options={[
                { label: "Auto", value: "AUTO" },
                { label: "Manual", value: "MANUAL" },
              ]}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} md={16}>
            <RangePicker
              value={dateRange}
              onChange={(value) => setDateRange(value)}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Card>

      <div className={styles.helperRow}>
        <Tag color="blue">School attendance records</Tag>
        <Text type="secondary">
          Filters update the full attendance list without leaving the page.
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
                description="No attendance records found"
              />
            ),
          }}
        />

        {meta ? (
          <div className={styles.footer}>
            <Text type="secondary">
              Page {meta.page} of {meta.totalPages} • {meta.total} records
            </Text>
          </div>
        ) : null}
      </Card>

      <Card variant="borderless" className={styles.tableCard}>
        <div className={styles.sectionHead}>
          <div>
            <Title level={4} className={styles.sectionTitle}>
              Teacher attendance
            </Title>
            <Text type="secondary">
              Daily teacher check-in and check-out records synced from the
              backend.
            </Text>
          </div>

          <Space wrap>
            <Button icon={<ReloadOutlined />} onClick={() => refetchTeacher()}>
              Refresh teachers
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className={styles.metricCard}>
              <Statistic title="Teacher records" value={teacherItems.length} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className={styles.metricCard}>
              <Statistic title="Check-ins" value={teacherCheckedInCount} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className={styles.metricCard}>
              <Statistic title="Check-outs" value={teacherCheckedOutCount} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className={styles.metricCard}>
              <Statistic title="Leave" value={teacherLeaveCount} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col xs={24} md={8}>
            <Input
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teacher name, employee ID..."
              allowClear
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              value={teacherStatus || undefined}
              onChange={setTeacherStatus}
              placeholder="Status"
              options={[
                { label: "Present", value: "PRESENT" },
                { label: "Late", value: "LATE" },
                { label: "Checked in", value: "CHECKED_IN" },
                { label: "Checked out", value: "CHECKED_OUT" },
                { label: "Leave", value: "LEAVE" },
                { label: "Half day", value: "HALF_DAY" },
                { label: "Pending", value: "PENDING" },
              ]}
              allowClear
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} md={8}>
            <RangePicker
              value={teacherDateRange}
              onChange={(value) => setTeacherDateRange(value)}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>

        <div className={styles.helperRow}>
          <Tag color="gold">Teacher attendance history</Tag>
          <Text type="secondary">
            Filter by teacher name, employee ID, phone, status, or date range.
          </Text>
        </div>

        <ResponsiveTable
          rowKey="key"
          loading={teacherLoading || teacherFetching}
          dataSource={teacherRows}
          pagination={{
            current: teacherPage,
            pageSize: limit,
            total: teacherMeta?.total || teacherItems.length,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: (nextPage: number) => setTeacherPage(nextPage),
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

        {teacherMeta ? (
          <div className={styles.footer}>
            <Text type="secondary">
              Page {teacherMeta.page} of {teacherMeta.totalPages} •{" "}
              {teacherMeta.total} records
            </Text>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
