"use client";

import { BookOutlined, NumberOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

import { showToast } from "@/src/utils/toast";
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

export default function CreateExamScreen({
  open,
  onClose,
  onSuccess,
  editData,
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  const [createExam] = useCreateExamMutation();
  const [updateExam] = useUpdateExamMutation();

  /* ================= PREFILL ================= */
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
  }, [editData, open]);

  /* ================= SUBMIT ================= */
  const onFinish = async (values: FormValues) => {
    try {
      setLoading(true);

      if (!values.dateRange) {
        return showToast.error("Select date range");
      }

      const [start, end] = values.dateRange;

      if (end.isBefore(start)) {
        return showToast.error("End date must be after start date");
      }

      const payload = {
        name: values.name,
        examType: values.examType,
        totalMarks: Number(values.totalMarks),
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      };

      let res;

      if (editData?._id) {
        res = await updateExam({
          id: editData._id,
          data: payload,
        }).unwrap();
      } else {
        res = await createExam(payload).unwrap();
      }

      showToast.apiResponse(res, "Exam saved");

      form.resetFields();
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast.apiError(err, "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} centered width={600}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <BookOutlined style={{ fontSize: 28, color: "#1677ff" }} />
        <Title level={4}>{editData ? "Edit Exam" : "Create Exam"}</Title>
        <Text type="secondary">Define exam (schedule later)</Text>
      </div>

      <Divider />

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Row gutter={[16, 12]}>
          {/* NAME */}
          <Col span={24}>
            <Form.Item
              name="name"
              label="Exam Name"
              rules={[{ required: true }]}
            >
              <Input prefix={<BookOutlined />} size="large" />
            </Form.Item>
          </Col>

          {/* MARKS */}
          <Col xs={24} md={12}>
            <Form.Item
              name="totalMarks"
              label="Total Marks"
              rules={[{ required: true }]}
            >
              <Input type="number" prefix={<NumberOutlined />} size="large" />
            </Form.Item>
          </Col>

          {/* TYPE */}
          <Col xs={24} md={12}>
            <Form.Item
              name="examType"
              label="Exam Type"
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                options={[
                  { label: "Mid Term", value: "mid_term" },
                  { label: "Final", value: "final" },
                ]}
              />
            </Form.Item>
          </Col>

          {/* DATE */}
          <Col span={24}>
            <Form.Item
              name="dateRange"
              label="Exam Duration"
              rules={[{ required: true }]}
            >
              <DatePicker.RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          {/* SUBMIT */}
          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              {editData ? "Update Exam" : "Create Exam"}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
