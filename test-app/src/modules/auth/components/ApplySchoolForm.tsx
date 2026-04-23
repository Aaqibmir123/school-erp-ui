"use client";

import { Button, Card, Col, Form, Input, Row, Typography, message } from "antd";

import {
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApplySchoolDTO } from "../../../../../shared-types/auth.types";
import { useApplySchool } from "../hooks/useApplySchool";

const { Title, Text } = Typography;

export default function ApplySchoolForm() {
  const { applySchool, loading } = useApplySchool();
  const router = useRouter();

  const [form] = Form.useForm();

  const onFinish = async (values: ApplySchoolDTO) => {
    try {
      await applySchool(values);
      message.success("Application submitted");
      router.push("/application-pending");
    } catch {
      message.error("Failed to submit");
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <div style={styles.header}>
          <BankOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <Title level={3} style={{ margin: "10px 0 4px" }}>
            Register School
          </Title>
          <Text type="secondary">Start using the School ERP system</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* 🔥 SCHOOL NAME */}
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
              placeholder="Enter school name"
            />
          </Form.Item>

          {/* 🔥 PRINCIPAL */}
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
              placeholder="Enter principal name"
            />
          </Form.Item>

          <Row gutter={12}>
            {/* 🔥 EMAIL */}
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter valid email" },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="School email"
                />
              </Form.Item>
            </Col>

            {/* 🔥 PHONE */}
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
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
                  placeholder="Phone number"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 🔥 ADDRESS */}
          <Form.Item
            name="address"
            label="Address"
            rules={[
              { required: true, message: "Address is required" },
              { min: 5, message: "Too short" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="School address" />
          </Form.Item>

          {/* 🔥 BUTTON */}
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            block
            style={styles.button}
          >
            Submit Application
          </Button>
        </Form>

        {/* 🔥 LOGIN LINK */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">
            Already registered?{" "}
            <Link href="/" style={styles.link}>
              Login
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
    padding: 20,
  },
  card: {
    width: 620,
    borderRadius: 10,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: 20,
  },
  button: {
    height: 44,
    marginTop: 6,
    fontWeight: 600,
  },
  link: {
    color: "#1677ff",
    fontWeight: 600,
  },
};
