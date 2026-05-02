"use client";

import {
  Button,
  DatePicker,
  Grid,
  Form,
  Select,
  Space,
  Tag,
  TimePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { showToast } from "@/src/utils/toast";
import ResponsiveTable from "@/src/components/ResponsiveTable";
import { useGetTeachersQuery } from "../api/teacherApi";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import type { SchoolTimingSettings } from "../school/schoolSettings.types";
import {
  useCreateScheduleMutation,
  usePreviewScheduleMutation,
  useSuggestTimeSlotsMutation,
} from "./exam.api";

interface FormValues {
  classId: string;
  subjectId: string;
  sectionId?: string;
  inchargeTeacherId?: string;
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}

interface PreviewItem {
  section: string;
  teacherName: string | null;
  inchargeName: string | null;
  conflict: boolean;
  inchargeConflict: boolean;
  hasTeacher: boolean;
  hasIncharge: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const toMinutes = (value?: string) => {
  if (!value) return null;
  const parsed = dayjs(value, "HH:mm");
  if (!parsed.isValid()) return null;
  return parsed.hour() * 60 + parsed.minute();
};

const normalizeExamType = (value?: string) =>
  value?.toLowerCase().replace(/[^a-z0-9]+/g, "") || "";

const isSectionBasedExam = (value?: string) => {
  const normalized = normalizeExamType(value);
  return normalized.includes("classtest") || normalized.includes("unittest");
};

export default function AddScheduleForm({
  examId,
  examType,
  onSuccess,
  classes,
  schoolTiming,
}: {
  examId: string;
  examType?: string;
  onSuccess?: () => void;
  classes: any[];
  schoolTiming: Partial<SchoolTimingSettings>;
}) {
  const [form] = Form.useForm<FormValues>();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [suggestions, setSuggestions] = useState<TimeSlot[]>([]);

  const showSectionField = isSectionBasedExam(examType);
  const { data: classSections = [] } = useGetSectionsByClassQuery(
    selectedClass || "",
    {
      skip: !selectedClass || !showSectionField,
    },
  );
  const { data: teachers = [] } = useGetTeachersQuery();

  const [previewSchedule, { isLoading: previewLoading }] =
    usePreviewScheduleMutation();
  const [suggestTimeSlots] = useSuggestTimeSlotsMutation();
  const [createSchedule, { isLoading }] = useCreateScheduleMutation();

  useEffect(() => {
    if (!showSectionField) {
      form.setFieldsValue({ sectionId: undefined });
    }
  }, [form, showSectionField]);

  const subjects = useMemo(() => {
    if (!selectedClass) return [];
    const cls = classes.find((item: any) => (item.classId || item._id) === selectedClass);
    return cls?.subjects || [];
  }, [selectedClass, classes]);

  const schoolStart = schoolTiming.schoolStartTime || "08:00";
  const schoolEnd = schoolTiming.schoolEndTime || "15:00";
  const schoolStartMinutes = toMinutes(schoolStart);
  const schoolEndMinutes = toMinutes(schoolEnd);

  const isWithinSchoolTime = (startTime: string, endTime: string) => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (start === null || end === null) return false;
    if (schoolStartMinutes === null || schoolEndMinutes === null) return true;
    return start >= schoolStartMinutes && end <= schoolEndMinutes;
  };

  const watched = Form.useWatch([], form);

  const isPreviewReady =
    watched?.classId &&
    watched?.subjectId &&
    watched?.date &&
    watched?.startTime &&
    watched?.endTime &&
    (!showSectionField || watched?.sectionId);

  const isSuggestReady = watched?.classId && watched?.subjectId && watched?.date;

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      const startTime = values.startTime.format("HH:mm");
      const endTime = values.endTime.format("HH:mm");

      if (endTime <= startTime) {
        showToast.error("End time must be after start time");
        return;
      }

      if (!isWithinSchoolTime(startTime, endTime)) {
        showToast.error("Schedule time must stay within school hours");
        return;
      }

      const res: any = await previewSchedule({
        examId,
        classId: values.classId,
        subjectId: values.subjectId,
        sectionId: showSectionField ? values.sectionId : undefined,
        inchargeTeacherId: values.inchargeTeacherId,
        date: values.date.format("YYYY-MM-DD"),
        startTime,
        endTime,
      }).unwrap();

      const data = Array.isArray(res) ? res : res?.data || [];
      setPreviewData(data);
    } catch (err: any) {
      showToast.apiError(err, "Unable to preview schedule");
    }
  };

  const handleSuggest = async () => {
    try {
      const values = await form.validateFields(["classId", "subjectId", "date"]);
      const res: any = await suggestTimeSlots({
        classId: values.classId,
        subjectId: values.subjectId,
        date: values.date.format("YYYY-MM-DD"),
      }).unwrap();

      const data = (Array.isArray(res) ? res : res?.data || []).filter(
        (slot: TimeSlot) => isWithinSchoolTime(slot.startTime, slot.endTime),
      );

      setSuggestions(data);
    } catch (err: any) {
      showToast.apiError(err, "Unable to suggest time slots");
    }
  };

  const onFinish = async (values: FormValues) => {
    try {
      const hasIssue = previewData.some((item) => item.conflict || item.inchargeConflict);
      if (hasIssue) {
        showToast.error("Resolve the preview issues before saving");
        return;
      }

      const startTime = values.startTime.format("HH:mm");
      const endTime = values.endTime.format("HH:mm");

      if (endTime <= startTime) {
        showToast.error("End time must be after start time");
        return;
      }

      if (!isWithinSchoolTime(startTime, endTime)) {
        showToast.error("Schedule time must stay within school hours");
        return;
      }

      await createSchedule({
        examId,
        classId: values.classId,
        subjectId: values.subjectId,
        sectionId: showSectionField ? values.sectionId : undefined,
        inchargeTeacherId: values.inchargeTeacherId,
        date: values.date.format("YYYY-MM-DD"),
        startTime,
        endTime,
      }).unwrap();

      showToast.success("Schedule added successfully");
      form.resetFields();
      setPreviewData([]);
      setSuggestions([]);
      setSelectedClass(null);
      onSuccess?.();
    } catch (err: any) {
      showToast.apiError(err, "Unable to save schedule");
    }
  };

  const previewColumns = [
    {
      title: "Section",
      dataIndex: "section",
    },
    {
      title: "Teacher",
      render: (_: any, row: PreviewItem) =>
        row.hasTeacher ? (
          <Tag color="green">{row.teacherName}</Tag>
        ) : (
          <Tag color="gold">Optional</Tag>
        ),
    },
    {
      title: "Incharge",
      render: (_: any, row: PreviewItem) =>
        row.hasIncharge ? (
          <Tag color="geekblue">{row.inchargeName}</Tag>
        ) : (
          <Tag color="default">Optional</Tag>
        ),
    },
    {
      title: "Status",
      render: (_: any, row: PreviewItem) =>
        row.conflict || row.inchargeConflict ? (
          <Tag color="red">Conflict</Tag>
        ) : (
          <Tag color="blue">OK</Tag>
        ),
    },
  ];

  return (
    <>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(6, minmax(0, 1fr))",
          alignItems: "end",
        }}
      >
        <Form.Item name="classId" rules={[{ required: true }]} style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <Select
            placeholder="Select class"
            style={{ width: "100%" }}
            onChange={(value) => {
              setSelectedClass(value);
              form.setFieldsValue({
                subjectId: undefined,
                sectionId: undefined,
                inchargeTeacherId: undefined,
              });
              setPreviewData([]);
              setSuggestions([]);
            }}
            options={classes.map((item: any) => ({
              label: item.name || item.className,
              value: item._id || item.classId,
            }))}
          />
        </Form.Item>

        <Form.Item name="subjectId" rules={[{ required: true }]} style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <Select
            placeholder="Select subject"
            style={{ width: "100%" }}
            disabled={!selectedClass}
            options={subjects.map((subject: any) => ({
              label: subject.name,
              value: subject._id,
            }))}
          />
        </Form.Item>

        <Form.Item name="inchargeTeacherId" style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <Select
            placeholder="Exam incharge (optional)"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            options={teachers.map((teacher: any) => ({
              label: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
              value: teacher._id,
            }))}
          />
        </Form.Item>

        {showSectionField ? (
          <Form.Item
            name="sectionId"
            rules={[{ required: true, message: "Select section" }]}
            style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}
          >
            <Select
              placeholder="Select section"
              style={{ width: "100%" }}
              disabled={!selectedClass}
              options={classSections.map((section: any) => ({
                label: section.name,
                value: section._id,
              }))}
            />
          </Form.Item>
        ) : null}

        <Form.Item name="date" rules={[{ required: true }]} style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <DatePicker placeholder="Select exam date" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="startTime" rules={[{ required: true }]} style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <TimePicker
            use12Hours
            format="h:mm A"
            minuteStep={1}
            placeholder="Start time"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item name="endTime" rules={[{ required: true }]} style={{ marginBottom: 0, gridColumn: isMobile ? "auto" : "span 1" }}>
          <TimePicker
            use12Hours
            format="h:mm A"
            minuteStep={1}
            placeholder="End time"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Space wrap size={8} style={{ marginTop: 2, gridColumn: isMobile ? "auto" : "1 / -1" }}>
          <Button onClick={handlePreview} loading={previewLoading} disabled={!isPreviewReady}>
            Preview
          </Button>

          <Button onClick={handleSuggest} disabled={!isSuggestReady}>
            Suggest
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={!isPreviewReady || previewData.some((item) => item.conflict || item.inchargeConflict)}
          >
            Save Schedule
          </Button>
        </Space>
      </Form>

      <div
        style={{
          alignItems: "center",
          background: "#f8fbff",
          border: "1px solid #dbeafe",
          borderRadius: 14,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 14,
          padding: "10px 12px",
        }}
      >
        <Tag color="blue" style={{ margin: 0 }}>
          School starts: {dayjs(schoolStart, "HH:mm").format("h:mm A")}
        </Tag>
        <Tag color="blue" style={{ margin: 0 }}>
          School ends: {dayjs(schoolEnd, "HH:mm").format("h:mm A")}
        </Tag>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          Schedule slots follow school-wide timing settings.
        </span>
      </div>

      {previewData.length > 0 ? (
        <ResponsiveTable
          rowKey="section"
          columns={previewColumns}
          dataSource={previewData}
          pagination={false}
          style={{ marginTop: 16 }}
        />
      ) : null}

      {suggestions.length > 0 ? (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {suggestions.map((slot) => {
            const start = dayjs(slot.startTime, "HH:mm").format("h:mm A");
            const end = dayjs(slot.endTime, "HH:mm").format("h:mm A");

            return (
              <Tag
                key={`${slot.startTime}-${slot.endTime}`}
                color="blue"
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
                }}
                onClick={() => {
                  form.setFieldsValue({
                    startTime: dayjs(slot.startTime, "HH:mm"),
                    endTime: dayjs(slot.endTime, "HH:mm"),
                  });
                }}
              >
                {start} - {end}
              </Tag>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
