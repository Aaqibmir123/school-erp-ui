"use client";

import {
  LockOutlined,
  LoginOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { showToast } from "@/src/utils/toast";
import { LoginDTO } from "../../../../../shared-types/auth.types";
import { useLogin } from "../hooks/useLogin";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const { login, loading } = useLogin();

  const onFinish = async (values: LoginDTO) => {
    try {
      const result = await login(values);

      showToast.success("Login successful");

      const nextRoute =
        result.user.role === "SUPER_ADMIN"
          ? "/super-admin"
          : result.user.role === "SCHOOL_ADMIN"
            ? "/school-admin"
            : "/school-admin";

      router.replace(nextRoute);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";

      showToast.error(message);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.brandPanel} aria-label="Platform summary">
        <div className={styles.brandOverlay}>
          <p className={styles.brandEyebrow}>School ERP SaaS</p>
          <h1 className={styles.brandTitle}>
            One control room for academics, operations, and growth.
          </h1>
          <p className={styles.brandDesc}>
            Manage attendance, fees, exams, timetables, and teacher workflows
            from one secure admin workspace.
          </p>

          <div className={styles.highlightRow}>
            <span className={styles.highlightChip}>Realtime dashboards</span>
            <span className={styles.highlightChip}>Role-based access</span>
            <span className={styles.highlightChip}>Performance-ready</span>
          </div>
        </div>
      </section>

      <section className={styles.formPanel} aria-label="Login form">
        <Card className={styles.card} variant="borderless">
          <div className={styles.header}>
            <ReadOutlined
              style={{ color: "var(--color-primary)", fontSize: 28 }}
            />
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>
              Sign in to continue managing your school operations securely.
            </p>
          </div>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Email or Phone"
              name="email"
              rules={[{ required: true, message: "Enter email or phone" }]}
            >
              <Input
                size="large"
                prefix={<UserOutlined />}
                placeholder="Enter email or phone"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Enter password" }]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              icon={<LoginOutlined />}
              loading={loading}
              className={styles.loginBtn}
            >
              Login
            </Button>
          </Form>

          <div className={styles.footer}>
            <p>Need a new school workspace?</p>
            <Link href="/apply-school" className={styles.footerLink}>
              Apply for School
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
