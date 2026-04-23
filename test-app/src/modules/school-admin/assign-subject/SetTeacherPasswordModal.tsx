"use client";

import { Button, Form, Input, Modal } from "antd";
import { useSetTeacherPasswordMutation } from "./teacherAssignment.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SetTeacherPasswordModal({ open, onClose }: Props) {
  const [form] = Form.useForm();

  const [setPassword, { isLoading }] = useSetTeacherPasswordMutation();

  const handleSubmit = async (values: any) => {
    try {
      await setPassword({ password: values.password }).unwrap();

      form.resetFields();
      onClose();
    } catch (err) {
      console.log(err); // ❌ toast later handle karenge
    }
  };

  return (
    <Modal
      title="Set Teachers Password"
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* PASSWORD */}
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Enter password" },
            { min: 6, message: "Minimum 6 characters" },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        {/* CONFIRM PASSWORD */}
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirm password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm password" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Save Password
        </Button>
      </Form>
    </Modal>
  );
}
