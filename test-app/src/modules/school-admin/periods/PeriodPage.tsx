"use client";

import { BankOutlined, ClockCircleOutlined } from "@ant-design/icons";
import {
  App,
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
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { showToast } from "@/src/utils/toast";
import {
  useCreatePeriodMutation,
  useDeletePeriodMutation,
  useGetPeriodsQuery,
  useUpdatePeriodMutation,
} from "./periodApi";
import { PeriodType } from "@/shared-types/period.types";
import { useSchool } from "../school/useSchool";
import type {
  SchoolTimingSettings,
  WeekdayValue,
} from "../school/schoolSettings.types";

const { Text } = Typography;

export default function PeriodPage() {
  const router = useRouter();
  const { modal } = App.useApp();
  const { data: periods = [] } = useGetPeriodsQuery();
  const { school, loading: schoolLoading } = useSchool();

  const [createPeriodApi, { isLoading }] = useCreatePeriodMutation();
  const [updatePeriodApi, { isLoading: isUpdating }] =
    useUpdatePeriodMutation();
  const [deletePeriodApi] = useDeletePeriodMutation();

  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [type, setType] = useState<PeriodType>(PeriodType.CLASS);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);

  const schoolTiming: Partial<SchoolTimingSettings> = useMemo(
    () => ({
      schoolStartTime: school?.schoolStartTime,
      schoolEndTime: school?.schoolEndTime,
      workingDays: school?.workingDays as WeekdayValue[] | undefined,
    }),
    [school],
  );

  const sortedPeriods = useMemo(
    () => [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [periods],
  );

  const schoolStart = schoolTiming.schoolStartTime || "08:00";
  const schoolEnd = schoolTiming.schoolEndTime || "15:00";
  const workingDays = schoolTiming.workingDays?.join(", ") || "Mon-Fri";

  const resetForm = () => {
    setStartTime(null);
    setEndTime(null);
    setType(PeriodType.CLASS);
    setEditingPeriodId(null);
  };

  const createPeriod = async () => {
    if (!startTime || !endTime) {
      showToast.warning("Select start and end time");
      return;
    }

    const start = startTime.format("HH:mm");
    const end = endTime.format("HH:mm");

    if (end <= start) {
      showToast.error("End time must be after start time");
      return;
    }

    try {
      if (editingPeriodId) {
        await updatePeriodApi({
          id: editingPeriodId,
          data: {
            name: `${type} slot`,
            periodNumber: sortedPeriods.length + 1,
            startTime: start,
            endTime: end,
            type,
          },
        }).unwrap();

        showToast.success("Time slot updated successfully");
      } else {
        await createPeriodApi({
          name: `${type} slot`,
          periodNumber: sortedPeriods.length + 1,
          startTime: start,
          endTime: end,
          type,
        }).unwrap();

        showToast.success("Time slot added successfully");
      }

      resetForm();
    } catch (err: any) {
      showToast.apiError(
        err,
        editingPeriodId ? "Unable to update time slot" : "Unable to create time slot",
      );
    }
  };

  const startEdit = (record: any) => {
    setEditingPeriodId(record._id);
    setStartTime(dayjs(record.startTime, "HH:mm"));
    setEndTime(dayjs(record.endTime, "HH:mm"));
    setType(record.type);
  };

  const convertEditingSlotToAm = () => {
    if (!startTime || !endTime) return;

    const nextStart = startTime.hour() >= 12 ? startTime.subtract(12, "hour") : startTime;
    const nextEnd = endTime.hour() >= 12 ? endTime.subtract(12, "hour") : endTime;

    setStartTime(nextStart);
    setEndTime(nextEnd);
  };

  const remove = async (id: string) => {
    try {
      const res = await deletePeriodApi({ id }).unwrap();

      if (res?.isLinked) {
        modal.confirm({
          title: "Period is in use",
          content:
            "This period is already used in the timetable. Delete it and remove linked timetable entries as well?",
          okText: "Delete Period",
          okType: "danger",
          cancelText: "Cancel",
          onOk: async () => {
            try {
              const finalRes = await deletePeriodApi({
                id,
                forceDelete: true,
              }).unwrap();

              showToast.apiResponse(finalRes, "Unable to delete period");
            } catch (err) {
              showToast.apiError(err, "Unable to delete linked period");
            }
          },
        });
        return;
      }

      showToast.apiResponse(res, "Unable to delete period");
    } catch (err) {
      showToast.apiError(err, "Unable to delete period");
    }
  };

  const formatTime = (time: string) => dayjs(time, "HH:mm").format("h:mm A");
  const labelType = (value: PeriodType) => {
    if (value === PeriodType.BREAK) return "Break Slot";
    if (value === PeriodType.LUNCH) return "Lunch Slot";
    if (value === PeriodType.ACTIVITY) return "Activity Slot";
    return "Class Slot";
  };

  const columns = [
    {
      title: "#",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Time",
      render: (_: any, record: any) => (
        <Text strong>
          {formatTime(record.startTime)} - {formatTime(record.endTime)}
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button onClick={() => startEdit(record)}>Edit</Button>
          <Button danger type="primary" ghost onClick={() => remove(record._id)}>
            Delete
          </Button>
        </div>
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
        School admin can create and edit time slots freely. School timings are
        shown here only as a reference.
      </Text>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <Tag color="blue">Start: {dayjs(schoolStart, "HH:mm").format("h:mm A")}</Tag>
        <Tag color="blue">End: {dayjs(schoolEnd, "HH:mm").format("h:mm A")}</Tag>
        <Tag color="blue">Days: {workingDays}</Tag>
      </div>

      <Row gutter={12} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <TimePicker
            use12Hours
            format="h:mm A"
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
            format="h:mm A"
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
            loading={isLoading || isUpdating}
            onClick={createPeriod}
          >
            {editingPeriodId ? "Update Slot" : "Add Slot"}
          </Button>
        </Col>
      </Row>

      {editingPeriodId ? (
        <div style={{ marginTop: 12 }}>
          <Button onClick={convertEditingSlotToAm} style={{ marginRight: 8 }}>
            Switch to AM
          </Button>
          <Button type="link" onClick={resetForm}>
            Cancel editing
          </Button>
        </div>
      ) : null}

      <Table
        dataSource={sortedPeriods}
        columns={columns}
        rowKey="_id"
        pagination={false}
        style={{ marginTop: 24 }}
        locale={{
          emptyText: "No time slots created yet",
        }}
      />
    </Card>
  );
}
