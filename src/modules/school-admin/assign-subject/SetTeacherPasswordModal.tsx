"use client";

import { Alert, Button, Checkbox, Form, Input, Modal } from "antd";
import { useState } from "react";

import { showToast } from "@/src/utils/toast";
import { useSetTeacherPasswordMutation } from "./teacherAssignment.api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SetTeacherPasswordModal({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const [confirmed, setConfirmed] = useState(false);
  const [setPassword, { isLoading }] = useSetTeacherPasswordMutation();

  const handleClose = () => {
    form.resetFields();
    setConfirmed(false);
    onClose();
  };

  const handleSubmit = async (values: { password: string }) => {
    try {
      await setPassword({ password: values.password }).unwrap();
      showToast.success("Same password has been applied to all teacher accounts");
      handleClose();
    } catch (err) {
      showToast.apiError(err, "Unable to update teacher passwords");
    }
  };

  return (
    <Modal
      title="Set Same Password For All Teachers"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={460}
      destroyOnHidden
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="This is a bulk action"
        description="Every teacher account in this school will receive the same new password. Use this only when you intentionally want one shared reset."
      />

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          label="New password for all teachers"
          name="password"
          rules={[
            { required: true, message: "Enter password" },
            { min: 6, message: "Minimum 6 characters" },
          ]}
        >
          <Input.Password placeholder="Enter new shared password" />
        </Form.Item>

        <Form.Item
          label="Confirm password"
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

        <Form.Item>
          <Checkbox
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          >
            I understand this will reset the password for every teacher account.
          </Checkbox>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          block
          danger
          loading={isLoading}
          disabled={!confirmed}
        >
          Reset All Teacher Passwords
        </Button>
      </Form>
    </Modal>
  );
}
