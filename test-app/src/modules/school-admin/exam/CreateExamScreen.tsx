"use client";

import { BookOutlined, NumberOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Tag,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import { showToast } from "@/src/utils/toast";
import { useGetAcademicYearsQuery } from "../academic-year/academicYear.api";
import { useCreateExamMutation, useUpdateExamMutation } from "./exam.api";

const { Title, Text } = Typography;

type FormValues = {
  name: string;
  totalMarks: number;
  examType: string;
  dateRange: [Dayjs, Dayjs];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
};

const DEFAULT_EXAM_TYPES = [
  "Mid Term",
  "Final",
  "Class Test",
  "Unit Test",
  "Quarterly",
  "Half Yearly",
];

export default function CreateExamScreen({
  open,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [examTypeOptions, setExamTypeOptions] = useState<string[]>(DEFAULT_EXAM_TYPES);
  const { data: academicYears = [] } = useGetAcademicYearsQuery();

  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();

  useEffect(() => {
    if (!open) return;

    if (editData) {
      form.setFieldsValue({
        name: editData.name,
        totalMarks: editData.totalMarks,
        examType: editData.examType,
        dateRange: [dayjs(editData.startDate), dayjs(editData.endDate)],
      });
    } else {
      form.resetFields();
    }
  }, [editData, open, form]);

  const activeYearName =
    academicYears.find((item) => item.isActive)?.name || "Active academic year";

  useEffect(() => {
    if (!open) return;

    setExamTypeOptions(DEFAULT_EXAM_TYPES);
  }, [open]);

  const normalizedOptions = useMemo(
    () =>
      examTypeOptions.map((type) => ({
        label: type,
        value: type,
      })),
    [examTypeOptions],
  );

  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      if (!values.dateRange) {
        showToast.error("Select exam dates");
        return;
      }

      const [start, end] = values.dateRange;
      if (end.isBefore(start)) {
        showToast.error("End date must be after start date");
        return;
      }

      const payload = {
        name: values.name.trim(),
        examType: values.examType.trim(),
        totalMarks: Number(values.totalMarks),
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      };

      if (!payload.name || !payload.examType) {
        showToast.error("Exam name and type are required");
        return;
      }

      if (payload.totalMarks <= 0) {
        showToast.error("Total marks must be greater than zero");
        return;
      }

      if (editData?._id) {
        await updateExam({
          id: editData._id,
          data: payload,
        }).unwrap();
        showToast.success("Exam updated successfully");
      } else {
        await createExam(payload).unwrap();
        showToast.success("Exam created successfully");
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast.apiError(err, "Unable to save exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={600}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <BookOutlined style={{ fontSize: 28, color: "#1677ff" }} />
        <Title level={4}>{editData ? "Edit Exam" : "Create Exam"}</Title>
        <Text type="secondary">Create the exam first, then schedule subjects and dates.</Text>
        <div style={{ marginTop: 8 }}>
          <Tag color="blue">{activeYearName}</Tag>
        </div>
      </div>

      <Divider />

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={[16, 12]}>
          <Col span={24}>
            <Form.Item name="name" label="Exam Name" rules={[{ required: true }]}>
              <Input
                prefix={<BookOutlined />}
                placeholder="Enter exam name"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="totalMarks" label="Total Marks" rules={[{ required: true }]}>
              <Input
                type="number"
                prefix={<NumberOutlined />}
                placeholder="Enter total marks"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="examType" label="Exam Type" rules={[{ required: true }]}>
              <AutoComplete
                placeholder="Type or select exam type"
                size="large"
                options={normalizedOptions}
                filterOption={(inputValue, option) =>
                  String(option?.value).toLowerCase().includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="dateRange" label="Exam Duration" rules={[{ required: true }]}>
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                placeholder={["Start date", "End date"]}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              {editData ? "Update Exam" : "Create Exam"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
