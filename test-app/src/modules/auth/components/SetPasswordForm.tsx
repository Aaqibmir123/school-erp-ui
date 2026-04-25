"use client";

import { Button, Form, Input } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

import { showToast } from "@/src/utils/toast";
import { useSetPassword } from "../hooks/useSetPassword";

export default function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const { submitPassword, loading } = useSetPassword();

  const onFinish = async (values: { password: string }) => {
    if (!token) {
      showToast.error("Invalid token");
      return;
    }

    await submitPassword(token, values.password);

    showToast.success("Password set successfully");

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
