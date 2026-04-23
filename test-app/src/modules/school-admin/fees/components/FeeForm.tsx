"use client";

import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Typography,
} from "antd";

import dayjs, { Dayjs } from "dayjs";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";

const { Text } = Typography;

/* ================= TYPES ================= */

interface FeeFormValues {
  month: string;
  feeCategory: string;
  feeType: string;
  totalAmount: number;
  paidAmount?: number;
  dueDate: Dayjs;
  paidDate?: Dayjs;
}

interface Props {
  initialValues?: Partial<FeeFormValues>;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

/* ================= MONTHS ================= */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((m) => ({ label: m, value: m }));

/* ================= COMPONENT ================= */

const FeeForm = forwardRef<any, Props>(
  ({ initialValues, onSubmit, loading }, ref) => {
    const [form] = Form.useForm<FeeFormValues>();

    /* 🔥 EXPOSE RESET */
    useImperativeHandle(ref, () => ({
      reset: () => form.resetFields(),
    }));

    /* ================= PREFILL ================= */

    useEffect(() => {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          dueDate: initialValues.dueDate
            ? dayjs(initialValues.dueDate)
            : undefined,
          paidDate: initialValues.paidDate
            ? dayjs(initialValues.paidDate)
            : undefined,
        });
      } else {
        form.resetFields();
      }
    }, [initialValues]);

    useImperativeHandle(ref, () => ({
      reset: () => form.resetFields(),
      setFields: (data: any) => {
        form.setFieldsValue({
          ...data,
          dueDate: data.dueDate ? dayjs(data.dueDate) : undefined,
          paidDate: data.paidDate ? dayjs(data.paidDate) : undefined,
        });
      },
    }));
    /* ================= WATCH ================= */

    const total = Form.useWatch("totalAmount", form) || 0;
    const paid = Form.useWatch("paidAmount", form) || 0;
    const category = Form.useWatch("feeCategory", form);

    const remaining = useMemo(() => total - paid, [total, paid]);

    const status = useMemo(() => {
      if (!total) return "unpaid";
      if (paid === total) return "paid";
      if (paid > 0) return "partial";
      return "unpaid";
    }, [total, paid]);

    /* ================= AUTO FEE TYPE ================= */

    useEffect(() => {
      if (category && category !== "other") {
        form.setFieldValue("feeType", category);
      } else {
        form.setFieldValue("feeType", "");
      }
    }, [category]);

    /* ================= SUBMIT ================= */

    const onFinish = (values: FeeFormValues) => {
      if ((values.paidAmount || 0) > values.totalAmount) {
        return message.error("Paid amount cannot exceed total");
      }

      onSubmit({
        ...values,

        // 🔥 IMPORTANT
        feeType:
          values.feeCategory === "other" ? values.feeType : values.feeCategory,

        paidAmount: values.paidAmount || 0,

        dueDate: values.dueDate.toISOString(),
        paidDate: values.paidDate?.toISOString(),
      });
    };

    /* ================= UI ================= */

    return (
      <Form layout="vertical" form={form} onFinish={onFinish}>
        {/* ROW 1 */}
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="month" label="Month" rules={[{ required: true }]}>
              <Select options={MONTHS} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="feeCategory"
              label="Fee Type"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="tuition">Academic Fee</Select.Option>
                <Select.Option value="transport">Transport Fee</Select.Option>
                <Select.Option value="exam">Exam Fee</Select.Option>
                <Select.Option value="fine">Fine</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* CUSTOM INPUT */}
        {category === "other" && (
          <Form.Item
            name="feeType"
            label="Custom Fee Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Picnic / Event Fee" />
          </Form.Item>
        )}

        {/* ROW 2 */}
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="totalAmount"
              label="Total Amount"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="paidAmount" label="Paid Amount">
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Col>
        </Row>

        {/* SUMMARY */}
        <div style={{ marginBottom: 12 }}>
          <Text strong>Remaining: </Text>
          <Text type={remaining > 0 ? "danger" : "success"}>₹ {remaining}</Text>

          <br />

          <Text strong>Status: </Text>
          <Text
            style={{
              color:
                status === "paid"
                  ? "green"
                  : status === "partial"
                    ? "orange"
                    : "red",
            }}
          >
            {status.toUpperCase()}
          </Text>
        </div>

        {/* ROW 3 */}
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="paidDate" label="Paid Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Button type="primary" htmlType="submit" loading={loading} block>
          Submit Fee
        </Button>
      </Form>
    );
  },
);
FeeForm.displayName = "FeeForm";

export default FeeForm;
