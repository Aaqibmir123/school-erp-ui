"use client";

import {
  Button,
  Card,
  Col,
  message,
  Modal,
  Row,
  Select,
  Table,
  Tag,
  TimePicker,
  Typography,
} from "antd";

import dayjs from "dayjs";
import { useMemo, useState } from "react";

import { showToast } from "@/src/utils/toast";
import {
  useCreatePeriodMutation,
  useDeletePeriodMutation,
  useGetPeriodsQuery,
} from "./periodApi";
import { PeriodType } from "@/shared-types/period.types";

const { Text } = Typography;

export default function PeriodPage() {
  const { data: periods = [] } = useGetPeriodsQuery();

  const [createPeriodApi, { isLoading }] = useCreatePeriodMutation();
  const [deletePeriodApi] = useDeletePeriodMutation();

  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [type, setType] = useState<PeriodType>(PeriodType.CLASS);

  /* 🔥 SORT BY TIME */
  const sortedPeriods = useMemo(() => {
    return [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [periods]);

  /* 🔥 CREATE */
  const createPeriod = async () => {
    if (!startTime || !endTime) {
      return message.warning("Select time");
    }

    const start = startTime.format("HH:mm");
    const end = endTime.format("HH:mm");

    if (end <= start) {
      return message.error("Invalid time range");
    }

    try {
      await createPeriodApi({
        name: `${type} period`,
        periodNumber: sortedPeriods.length + 1,
        startTime: start,
        endTime: end,
        type,
      }).unwrap();

      message.success("Added");

      setStartTime(null);
      setEndTime(null);
    } catch (err: any) {
      message.error(err?.data?.message || "Error");
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
          {record.type.toUpperCase()}
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
    <Card title="⏰ Period Time Slots" style={{ borderRadius: 12 }}>
      {/* 🔥 INFO */}
      <Text type="secondary">
        Define school time slots (Class / Break / Lunch)
      </Text>

      {/* 🔥 FORM */}
      <Row gutter={12} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <TimePicker
            use12Hours
            format="hh:mm A"
            minuteStep={5}
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
              { label: "Class", value: PeriodType.CLASS },
              { label: "Break", value: PeriodType.BREAK },
              { label: "Lunch", value: PeriodType.LUNCH },
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

