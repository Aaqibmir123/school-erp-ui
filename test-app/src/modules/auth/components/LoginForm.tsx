"use client";

import {
  BookOutlined,
  LockOutlined,
  LoginOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Form, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo } from "react";

import { LoginDTO } from "@/shared-types/auth.types";
import { getAuthErrorMessage } from "../utils/authError";
import { showToast } from "@/src/utils/toast";
import { useLogin } from "../hooks/useLogin";
import styles from "./LoginForm.module.css";

function LoginForm() {
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
      showToast.error(getAuthErrorMessage(error));
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.brandPanel} aria-label="Platform summary">
        <div className={styles.brandScrim} />
        <div className={styles.brandOverlay}>
          <div className={styles.brandBadge}>
            <BookOutlined />
            <span>Smart School ERP</span>
          </div>

          <h1 className={styles.brandTitle}>
            Run academics, people, fees, and operations from one admin workspace.
          </h1>

          <p className={styles.brandDesc}>
            Built for school teams that need fast daily control without juggling
            separate tools.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>
                <SafetyCertificateOutlined />
              </span>
              <div>
                <strong>Secure access</strong>
                <p>Role-based admin control</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>
                <LoginOutlined />
              </span>
              <div>
                <strong>Daily workflows</strong>
                <p>Attendance, fees, timetable, exams</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.formPanel} aria-label="Login form">
        <Card className={styles.card} variant="borderless">
          <div className={styles.mobileBrand}>
            <span className={styles.mobileBrandIcon}>
              <BookOutlined />
            </span>
            <div>
              <p className={styles.mobileBrandLabel}>Smart School ERP</p>
              <span className={styles.mobileBrandSub}>Admin Sign In</span>
            </div>
          </div>

          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <BookOutlined />
            </div>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>
              Sign in to continue managing your school workspace.
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

export default memo(LoginForm);
