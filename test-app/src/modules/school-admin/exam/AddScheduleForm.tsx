"use client";

import {
  Button,
  DatePicker,
  Form,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { showToast } from "@/src/utils/toast";
import { useGetSectionsByClassQuery } from "../sections/sectionApi";
import {
  useCreateScheduleMutation,
  usePreviewScheduleMutation,
  useSuggestTimeSlotsMutation,
} from "./exam.api";

/* ================= TYPES ================= */

interface FormValues {
  classId: string;
  subjectId: string;
  sectionId?: string;
  date: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}

interface PreviewItem {
  section: string;
  teacherName: string | null;
  conflict: boolean;
  hasTeacher: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

type SchoolTimingSettings = {
  schoolStartTime?: string;
  schoolEndTime?: string;
};

const TIMING_STORAGE_KEY = "school-admin:timing-settings";

const parseSchoolTimings = (): Partial<SchoolTimingSettings> => {
  if (typeof window === "undefined") return {};

  const raw = window.localStorage.getItem(TIMING_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Partial<SchoolTimingSettings>;
  } catch {
    return {};
  }
};

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

  return (
    normalized.includes("classtest") || normalized.includes("unittest")
  );
};

/* ================= COMPONENT ================= */

export default function AddScheduleForm({
  examId,
  examType,
  onSuccess,
  classes,
}: any) {
  const [form] = Form.useForm<FormValues>();

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [suggestions, setSuggestions] = useState<TimeSlot[]>([]);
  const [schoolTiming, setSchoolTiming] = useState<Partial<SchoolTimingSettings>>(
    {},
  );

  const showSectionField = isSectionBasedExam(examType);

  const { data: classSections = [] } = useGetSectionsByClassQuery(
    selectedClass || "",
    {
      skip: !selectedClass || !showSectionField,
    },
  );

  const [previewSchedule, { isLoading: previewLoading }] =
    usePreviewScheduleMutation();
  const [suggestTimeSlots] = useSuggestTimeSlotsMutation();
  const [createSchedule, { isLoading }] = useCreateScheduleMutation();

  useEffect(() => {
    const syncTiming = () => setSchoolTiming(parseSchoolTimings());

    syncTiming();
    window.addEventListener("school-timing-updated", syncTiming);

    return () => window.removeEventListener("school-timing-updated", syncTiming);
  }, []);

  useEffect(() => {
    if (!showSectionField) {
      form.setFieldsValue({ sectionId: undefined });
    }
  }, [form, showSectionField]);

  /* ================= SUBJECTS ================= */

  const subjects = useMemo(() => {
    if (!selectedClass) return [];

    const cls = classes.find(
      (c: any) => (c.classId || c._id) === selectedClass,
    );

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

  /* ================= VALIDATION WATCH ================= */

  const watched = Form.useWatch([], form);

  const isPreviewReady =
    watched?.classId &&
    watched?.subjectId &&
    watched?.date &&
    watched?.startTime &&
    watched?.endTime &&
    (!showSectionField || watched?.sectionId);

  const isSuggestReady =
    watched?.classId && watched?.subjectId && watched?.date;

  /* ================= PREVIEW ================= */

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();
      const startTime = values.startTime.format("HH:mm");
      const endTime = values.endTime.format("HH:mm");

      if (!isWithinSchoolTime(startTime, endTime)) {
        return showToast.error(
          "Schedule time must stay within School Time Management hours",
        );
      }

      const res: any = await previewSchedule({
        examId,
        classId: values.classId,
        subjectId: values.subjectId,
        sectionId: showSectionField ? values.sectionId : undefined,
        date: values.date.format("YYYY-MM-DD"),
        startTime,
        endTime,
      }).unwrap();

      const data = Array.isArray(res) ? res : res?.data || [];

      setPreviewData(data);
    } catch (err: any) {
      showToast.error(err?.data?.message || "Preview failed");
    }
  };

  /* ================= SUGGEST ================= */

  const handleSuggest = async () => {
    try {
      const values = await form.validateFields([
        "classId",
        "subjectId",
        "date",
      ]);

      const res: any = await suggestTimeSlots({
        classId: values.classId,
        subjectId: values.subjectId,
        date: values.date.format("YYYY-MM-DD"),
      }).unwrap();

      const data = (Array.isArray(res) ? res : res?.data || []).filter(
        (slot: TimeSlot) => isWithinSchoolTime(slot.startTime, slot.endTime),
      );

      setSuggestions(data);
    } catch {
      showToast.error("Suggestion failed");
    }
  };

  /* ================= SUBMIT ================= */

  const onFinish = async (values: FormValues) => {
    try {
      const hasIssue = previewData.some((p) => p.conflict || !p.hasTeacher);

      if (hasIssue) {
        return showToast.error("Fix issues before saving");
      }

      const startTime = values.startTime.format("HH:mm");
      const endTime = values.endTime.format("HH:mm");

      if (!isWithinSchoolTime(startTime, endTime)) {
        return showToast.error(
          "Schedule time must stay within School Time Management hours",
        );
      }

      await createSchedule({
        examId,
        classId: values.classId,
        subjectId: values.subjectId,
        sectionId: showSectionField ? values.sectionId : undefined,
        date: values.date.format("YYYY-MM-DD"),
        startTime,
        endTime,
      }).unwrap();

      showToast.success("Schedule added");

      form.resetFields();
      setPreviewData([]);
      setSuggestions([]);
      setSelectedClass(null);

      onSuccess?.();
    } catch (err: any) {
      showToast.error(err?.data?.message || "Failed");
    }
  };

  /* ================= PREVIEW TABLE ================= */

  const previewColumns = [
    {
      title: "Section",
      dataIndex: "section",
    },
    {
      title: "Teacher",
      render: (_: any, r: PreviewItem) =>
        r.hasTeacher ? (
          <Tag color="green" style={{ borderRadius: 20 }}>
            👨‍🏫 {r.teacherName}
          </Tag>
        ) : (
          <Tag color="red">No Teacher</Tag>
        ),
    },
    {
      title: "Status",
      render: (_: any, r: PreviewItem) =>
        r.conflict ? <Tag color="red">❌ Conflict</Tag> : <Tag color="blue">✅ OK</Tag>,
    },
  ];

  return (
    <>
      <Form
        form={form}
        onFinish={onFinish}
        layout="inline"
        style={{ gap: 10, rowGap: 10 }}
      >
        <Form.Item
          name="classId"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="Select class"
            style={{ width: 180 }}
            onChange={(v) => {
              setSelectedClass(v);
              form.setFieldsValue({ subjectId: undefined, sectionId: undefined });
              setPreviewData([]);
              setSuggestions([]);
            }}
            options={classes.map((c: any) => ({
              label: c.name || c.className,
              value: c._id || c.classId,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="subjectId"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="Select subject"
            style={{ width: 180 }}
            disabled={!selectedClass}
            options={subjects.map((s: any) => ({
              label: s.name,
              value: s._id,
            }))}
          />
        </Form.Item>

        {showSectionField && (
          <Form.Item
            name="sectionId"
            rules={[{ required: true, message: "Select section" }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="Select section"
              style={{ width: 180 }}
              disabled={!selectedClass}
              options={classSections.map((section: any) => ({
                label: section.name,
                value: section._id,
              }))}
            />
          </Form.Item>
        )}

        <Form.Item
          name="date"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <DatePicker placeholder="Select exam date" style={{ width: 180 }} />
        </Form.Item>

        <Form.Item
          name="startTime"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <TimePicker
            use12Hours
            format="h:mm A"
            minuteStep={1}
            placeholder="Start time"
            style={{ width: 160 }}
          />
        </Form.Item>

        <Form.Item
          name="endTime"
          rules={[{ required: true }]}
          style={{ marginBottom: 0 }}
        >
          <TimePicker
            use12Hours
            format="h:mm A"
            minuteStep={1}
            placeholder="End time"
            style={{ width: 160 }}
          />
        </Form.Item>

        <Space wrap size={8} style={{ marginTop: 2 }}>
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
            disabled={
              !isPreviewReady ||
              previewData.some((p) => p.conflict || !p.hasTeacher)
            }
          >
            Save
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
          School: {dayjs(schoolStart, "HH:mm").format("h:mm A")}
        </Tag>
        <Tag color="blue" style={{ margin: 0 }}>
          Ends: {dayjs(schoolEnd, "HH:mm").format("h:mm A")}
        </Tag>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          Schedule slots are filtered within school hours.
        </span>
      </div>

      {previewData.length > 0 && (
        <Table
          rowKey="section"
          columns={previewColumns}
          dataSource={previewData}
          pagination={false}
          style={{ marginTop: 16 }}
        />
      )}

      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {suggestions.map((s) => {
            const start = dayjs(s.startTime, "HH:mm").format("h:mm A");
            const end = dayjs(s.endTime, "HH:mm").format("h:mm A");

            return (
              <Tag
                key={s.startTime}
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
                    startTime: dayjs(s.startTime, "HH:mm"),
                    endTime: dayjs(s.endTime, "HH:mm"),
                  });
                }}
              >
                🕒 {start} → {end}
              </Tag>
            );
          })}
        </div>
      )}
    </>
  );
}
