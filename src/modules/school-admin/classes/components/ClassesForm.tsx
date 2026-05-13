"use client";

import { SCHOOL_CLASSES } from "@/src/constants/classes";
import { showToast } from "@/src/utils/toast";
import { Button, Card, Col, Form, Row, Select } from "antd";
import { useCreateClassMutation } from "../classes";

export default function ClassesForm() {
  const [form] = Form.useForm();
  const [createClass, { isLoading }] = useCreateClassMutation();

  const onFinish = async (values: any) => {
    try {
      const res = await createClass(values).unwrap();

      showToast.apiResponse(res, "Classes created");

      form.resetFields();
    } catch (err: any) {
      showToast.apiError(err);
    }
  };

  return (
    <Card title="Create Classes" style={{ borderRadius: 12 }}>
      <Form form={form} onFinish={onFinish}>
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Form.Item
              name="classes"
              rules={[{ required: true, message: "Select classes" }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                mode="multiple"
                placeholder="Select classes"
                options={SCHOOL_CLASSES.map((c) => ({
                  label: c,
                  value: c,
                }))}
              />
            </Form.Item>
          </Col>

          <Col>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Create
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
