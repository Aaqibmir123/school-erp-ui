"use client";

import {
  ArrowRightOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApplySchoolDTO } from "@/shared-types/auth.types";
import { showToast } from "@/src/utils/toast";
import { useApplySchool } from "../hooks/useApplySchool";
import { getAuthErrorMessage } from "../utils/authError";

const { Title, Text } = Typography;

type ApplySchoolFormValues = ApplySchoolDTO & {
  confirmPassword: string;
};

export default function ApplySchoolForm() {
  const { applySchool, loading } = useApplySchool();
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: ApplySchoolFormValues) => {
    try {
      const payload: ApplySchoolDTO = {
        address: values.address,
        email: values.email,
        password: values.password,
        phone: values.phone,
        principalName: values.principalName,
        schoolName: values.schoolName,
      };

      await applySchool(payload);
      showToast.success("Application submitted");
      router.push("/application-pending");
    } catch (error: unknown) {
      showToast.error(getAuthErrorMessage(error, "Failed to submit"));
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card} styles={{ body: { padding: 0 } }}>
        <div style={styles.hero}>
          <div style={styles.badge}>
            <BankOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <Title level={2} style={styles.title}>
            Register Your School
          </Title>
          <Text type="secondary" style={styles.subtitle}>
            Create an admin account and start managing classes, attendance,
            exams, and fees in one place.
          </Text>
        </div>

        <div style={styles.formWrap}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="schoolName"
                  label="School Name"
                  rules={[
                    { required: true, message: "School name is required" },
                    { min: 3, message: "Minimum 3 characters" },
                    {
                      pattern: /^[A-Za-z0-9\s]+$/,
                      message: "Only letters and numbers allowed",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<BankOutlined />}
                    placeholder="Sunrise Public School"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="principalName"
                  label="Principal Name"
                  rules={[
                    { required: true, message: "Principal name is required" },
                    { min: 3, message: "Minimum 3 characters" },
                    {
                      pattern: /^[A-Za-z\s]+$/,
                      message: "Only letters allowed",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="Principal full name"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Email is required" },
                    { type: "email", message: "Enter valid email" },
                  ]}
                >
                  <Input
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="school@email.com"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Phone is required" },
                    {
                      pattern: /^[6-9]\d{9}$/,
                      message: "Enter valid 10-digit phone number",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    maxLength={10}
                    prefix={<PhoneOutlined />}
                    placeholder="10-digit mobile number"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Admin Password"
                  rules={[
                    { required: true, message: "Password is required" },
                    {
                      min: 8,
                      message: "Use at least 8 characters for better security",
                    },
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<SafetyOutlined />}
                    placeholder="Create admin password"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error("Passwords do not match"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    prefix={<SafetyOutlined />}
                    placeholder="Re-enter password"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="address"
              label="Address"
              rules={[
                { required: true, message: "Address is required" },
                { min: 5, message: "Too short" },
              ]}
            >
              <Input.TextArea
                autoSize={{ minRows: 3, maxRows: 5 }}
                placeholder="Complete school address"
              />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              block
              icon={<ArrowRightOutlined />}
              style={styles.button}
            >
              Submit Application
            </Button>
          </Form>

          <div style={styles.footer}>
            <Text type="secondary">
              Already registered?{" "}
              <Link href="/" style={styles.link}>
                Login
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top, rgba(22,119,255,0.12), transparent 38%), linear-gradient(180deg, #f7faff 0%, #eef4ff 100%)",
    padding: 20,
  },
  card: {
    width: "min(760px, 100%)",
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15,23,42,0.10)",
    overflow: "hidden",
    border: "1px solid rgba(22,119,255,0.10)",
    background: "rgba(255,255,255,0.92)",
  },
  hero: {
    textAlign: "center" as const,
    padding: "28px 24px 20px",
  },
  badge: {
    alignItems: "center",
    background: "linear-gradient(135deg, #1677ff, #5b8cff)",
    borderRadius: 18,
    boxShadow: "0 12px 24px rgba(22,119,255,0.22)",
    display: "inline-flex",
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  title: {
    margin: "14px 0 6px",
  },
  subtitle: {
    display: "block",
    maxWidth: 560,
    margin: "0 auto",
  },
  formWrap: {
    padding: "0 24px 24px",
  },
  button: {
    height: 48,
    marginTop: 8,
    fontWeight: 700,
    borderRadius: 14,
  },
  link: {
    color: "#1677ff",
    fontWeight: 600,
  },
  footer: {
    textAlign: "center" as const,
    marginTop: 16,
  },
};
