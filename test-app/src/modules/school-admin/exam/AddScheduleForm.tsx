"use client";

import { Button, DatePicker, Form, Select, Table, Tag, TimePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import { showToast } from "@/src/utils/toast";
import {
  useCreateScheduleMutation,
  usePreviewScheduleMutation,
  useSuggestTimeSlotsMutation,
} from "./exam.api";

/* ================= TYPES ================= */

interface FormValues {
  classId: string;
  subjectId: string;
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

/* ================= COMPONENT ================= */

export default function AddScheduleForm({ examId, onSuccess, classes }: any) {
  const [form] = Form.useForm<FormValues>();

  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
  const [suggestions, setSuggestions] = useState<TimeSlot[]>([]);

  const [previewSchedule, { isLoading: previewLoading }] =
    usePreviewScheduleMutation();

  const [suggestTimeSlots] = useSuggestTimeSlotsMutation();

  const [createSchedule, { isLoading }] = useCreateScheduleMutation();

  /* ================= SUBJECTS ================= */

  const subjects = useMemo(() => {
    if (!selectedClass) return [];

    const cls = classes.find(
      (c: any) => (c.classId || c._id) === selectedClass,
    );

    return cls?.subjects || [];
  }, [selectedClass, classes]);

  /* ================= VALIDATION WATCH ================= */

  const watched = Form.useWatch([], form);

  const isPreviewReady =
    watched?.classId &&
    watched?.subjectId &&
    watched?.date &&
    watched?.startTime &&
    watched?.endTime;

  const isSuggestReady =
    watched?.classId && watched?.subjectId && watched?.date;

  /* ================= PREVIEW ================= */

  const handlePreview = async () => {
    try {
      const values = await form.validateFields();

      const res: any = await previewSchedule({
        classId: values.classId,
        subjectId: values.subjectId,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
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
     
      const data = Array.isArray(res) ? res : res?.data || [];

      setSuggestions(data);
    } catch (err: any) {
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

      await createSchedule({
        examId,
        classId: values.classId,
        subjectId: values.subjectId,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
      }).unwrap();

      showToast.success("✅ Schedule added");

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
        r.conflict ? (
          <Tag color="red">❌ Conflict</Tag>
        ) : (
          <Tag color="blue">✅ OK</Tag>
        ),
    },
  ];

  return (
    <>
      {/* ================= FORM ================= */}
      <Form form={form} onFinish={onFinish} layout="inline">
        {/* CLASS */}
        <Form.Item name="classId" rules={[{ required: true }]}>
          <Select
            placeholder="Class"
            style={{ width: 150 }}
            onChange={(v) => {
              setSelectedClass(v);
              form.setFieldsValue({ subjectId: undefined });
              setPreviewData([]);
              setSuggestions([]);
            }}
            options={classes.map((c: any) => ({
              label: c.name || c.className,
              value: c._id || c.classId,
            }))}
          />
        </Form.Item>

        {/* SUBJECT */}
        <Form.Item name="subjectId" rules={[{ required: true }]}>
          <Select
            placeholder="Subject"
            style={{ width: 150 }}
            disabled={!selectedClass}
            options={subjects.map((s: any) => ({
              label: s.name,
              value: s._id,
            }))}
          />
        </Form.Item>

        {/* DATE */}
        <Form.Item name="date" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>

        {/* TIME */}
        <Form.Item name="startTime" rules={[{ required: true }]}>
          <TimePicker use12Hours format="h:mm A" />
        </Form.Item>

        <Form.Item name="endTime" rules={[{ required: true }]}>
          <TimePicker use12Hours format="h:mm A" />
        </Form.Item>

        {/* BUTTONS */}
        <Button
          onClick={handlePreview}
          loading={previewLoading}
          disabled={!isPreviewReady}
        >
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
      </Form>

      {/* ================= PREVIEW ================= */}
      {previewData.length > 0 && (
        <Table
          rowKey="section"
          columns={previewColumns}
          dataSource={previewData}
          pagination={false}
          style={{ marginTop: 16 }}
        />
      )}

      {/* ================= SUGGESTIONS ================= */}
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
                  borderRadius: 20,
                  cursor: "pointer",
                  fontWeight: 500,
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
