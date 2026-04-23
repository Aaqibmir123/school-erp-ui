"use client";

import { Button, Form, Input, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetPassword } from "../hooks/useSetPassword";

export default function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const { submitPassword, loading } = useSetPassword();

  const onFinish = async (values: { password: string }) => {
    if (!token) {
      message.error("Invalid token");
      return;
    }

    await submitPassword(token, values.password);

    message.success("Password set successfully");

    router.push("/");
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="New Password"
        name="password"
        rules={[{ required: true }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Set Password
        </Button>
      </Form.Item>
    </Form>
  );
}
