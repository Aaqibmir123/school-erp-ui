"use client";

import { BankOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  TimePicker,
  Typography,
} from "antd";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/src/utils/toast";
import {
  useCreatePeriodMutation,
  useDeletePeriodMutation,
  useGetPeriodsQuery,
} from "./periodApi";
import { PeriodType } from "@/shared-types/period.types";
import type { SchoolTimingSettings } from "../school/schoolSettings.types";

const { Text } = Typography;
const TIMING_STORAGE_KEY = "school-admin:timing-settings";

export default function PeriodPage() {
  const router = useRouter();
  const { data: periods = [] } = useGetPeriodsQuery();

  const [createPeriodApi, { isLoading }] = useCreatePeriodMutation();
  const [deletePeriodApi] = useDeletePeriodMutation();

  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [type, setType] = useState<PeriodType>(PeriodType.CLASS);
  const [schoolTiming, setSchoolTiming] = useState<Partial<SchoolTimingSettings>>(
    {},
  );

  const loadSchoolTiming = () => {
    if (typeof window === "undefined") return {};

    const raw = window.localStorage.getItem(TIMING_STORAGE_KEY);
    if (!raw) return {};

    try {
      return JSON.parse(raw) as Partial<SchoolTimingSettings>;
    } catch {
      return {};
    }
  };

  useEffect(() => {
    const syncTiming = () => setSchoolTiming(loadSchoolTiming());

    syncTiming();
    window.addEventListener("school-timing-updated", syncTiming);

    return () => window.removeEventListener("school-timing-updated", syncTiming);
  }, []);

  /* 🔥 SORT BY TIME */
  const sortedPeriods = useMemo(() => {
    return [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [periods]);

  const schoolStart = schoolTiming.schoolStartTime || "08:00";
  const schoolEnd = schoolTiming.schoolEndTime || "15:00";
  const workingDays = schoolTiming.workingDays?.join(", ") || "Mon-Fri";

  /* 🔥 CREATE */
  const createPeriod = async () => {
    if (!startTime || !endTime) {
      return showToast.warning("Select time");
    }

    const start = startTime.format("HH:mm");
    const end = endTime.format("HH:mm");

    if (end <= start) {
      return showToast.error("Invalid time range");
    }

    if (start < schoolStart || end > schoolEnd) {
      return showToast.error(
        "Time slot must stay within School Time Management hours",
      );
    }

    try {
      await createPeriodApi({
        name: `${type} slot`,
        periodNumber: sortedPeriods.length + 1,
        startTime: start,
        endTime: end,
        type,
      }).unwrap();

      showToast.success("Time slot added");

      setStartTime(null);
      setEndTime(null);
    } catch (err: any) {
      showToast.error(err?.data?.message || "Error");
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await deletePeriodApi({ id }).unwrap();

      // 💣 LINKED CASE
      if (res?.isLinked) {
        Modal.confirm({
          title: "⚠️ Period is in use",
          content:
            "This period is used in timetable. Delete it along with related timetable entries?",
          okText: "Delete",
          okType: "danger",
          cancelText: "Cancel",

          onOk: async () => {
            try {
              const finalRes = await deletePeriodApi({
                id,
                forceDelete: true,
              }).unwrap();

              showToast.apiResponse(finalRes, "Delete failed");
            } catch (err) {
              showToast.apiError(err);
            }
          },
        });

        return;
      }

      // ✅ NORMAL DELETE
      showToast.apiResponse(res, "Delete failed");
    } catch (err) {
      showToast.apiError(err);
    }
  };

  /* 🔥 FORMAT TIME */
  const formatTime = (time: string) => dayjs(time, "HH:mm").format("hh:mm A");
  const labelType = (value: PeriodType) => {
    if (value === PeriodType.BREAK) return "Break Slot";
    if (value === PeriodType.LUNCH) return "Lunch Slot";
    if (value === PeriodType.ACTIVITY) return "Activity Slot";

    return "Class Slot";
  };

  /* 🔥 TABLE */
  const columns = [
    {
      title: "#",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Time",
      render: (_: any, record: any) => (
        <Text strong>
          {formatTime(record.startTime)} – {formatTime(record.endTime)}
        </Text>
      ),
    },
    {
      title: "Type",
      render: (_: any, record: any) => (
        <Tag
          style={{ padding: "4px 12px", borderRadius: 8 }}
          color={
            record.type === "break"
              ? "orange"
              : record.type === "lunch"
                ? "red"
            : "blue"
          }
        >
          {labelType(record.type)}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <Button danger type="primary" ghost onClick={() => remove(record._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          School Time Slots
        </span>
      }
      extra={
        <Button
          type="link"
          icon={<BankOutlined />}
          onClick={() => router.push("/school-admin/settings")}
        >
          Open Time Management
        </Button>
      }
      style={{ borderRadius: 12 }}
    >
      <Text type="secondary">
        Class slots are linked to School Time Management and working days.
      </Text>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Tag color="blue">Start: {dayjs(schoolStart, "HH:mm").format("hh:mm A")}</Tag>
        <Tag color="blue">End: {dayjs(schoolEnd, "HH:mm").format("hh:mm A")}</Tag>
        <Tag color="blue">Days: {workingDays}</Tag>
      </div>

      {/* 🔥 FORM */}
      <Row gutter={12} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <TimePicker
            use12Hours
            format="hh:mm A"
            minuteStep={1}
            style={{ width: "100%" }}
            value={startTime}
            onChange={setStartTime}
            placeholder="Start Time"
          />
        </Col>

        <Col xs={24} md={6}>
          <TimePicker
            use12Hours
            format="hh:mm A"
            minuteStep={1}
            style={{ width: "100%" }}
            value={endTime}
            onChange={setEndTime}
            placeholder="End Time"
          />
        </Col>

        <Col xs={24} md={6}>
          <Select
            value={type}
            onChange={setType}
            style={{ width: "100%" }}
            options={[
              { label: "Class Slot", value: PeriodType.CLASS },
              { label: "Break Slot", value: PeriodType.BREAK },
              { label: "Lunch Slot", value: PeriodType.LUNCH },
            ]}
          />
        </Col>

        <Col xs={24} md={6}>
          <Button
            type="primary"
            block
            loading={isLoading}
            onClick={createPeriod}
          >
            + Add Slot
          </Button>
        </Col>
      </Row>

      {/* 🔥 TABLE */}
      <Table
        dataSource={sortedPeriods}
        columns={columns}
        rowKey="_id"
        pagination={false}
        style={{ marginTop: 24 }}
      />
    </Card>
  );
}

