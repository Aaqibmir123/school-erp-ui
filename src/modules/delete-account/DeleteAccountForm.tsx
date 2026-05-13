"use client";

import { CheckCircleOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Select, Typography } from "antd";
import { useState } from "react";

import styles from "./DeleteAccountForm.module.css";

const roles = ["Parent", "Teacher", "Student", "Staff", "Other"];

type DeleteAccountFormValues = {
  fullName: string;
  reason: string;
  registeredPhoneNumber: string;
  role: string;
  schoolName: string;
};

export default function DeleteAccountForm() {
  const [form] = Form.useForm<DeleteAccountFormValues>();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    requestId?: string | null;
    type: "error" | "success";
  } | null>(null);

  const onFinish = async (values: DeleteAccountFormValues) => {
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/delete-account", {
        body: JSON.stringify(values),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to submit request");
      }

      form.resetFields();
      setFeedback({
        message: "Your account deletion request has been submitted successfully.",
        requestId: payload?.data?.requestId || null,
        type: "success",
      });
    } catch (error: any) {
      setFeedback({
        message: error?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.shell}>
      <section className={styles.panel}>
        <div className={styles.hero}>
          <div className={styles.eyebrow}>Google Play compliance</div>
          <Typography.Title className={styles.title} level={1}>
            Delete Smart School ERP Account
          </Typography.Title>
          <Typography.Paragraph className={styles.lead}>
            Users can request deletion of their account and associated data.
            Fill the form below and our team will review the request.
          </Typography.Paragraph>

          <div className={styles.chipRow}>
            <span className={styles.chip}>
              <CheckCircleOutlined />
              Secure request handling
            </span>
            <span className={styles.chip}>
              <PhoneOutlined />
              Works on mobile and desktop
            </span>
          </div>
        </div>

        <div className={styles.formWrap}>
          <Typography.Title className={styles.formTitle} level={2}>
            Account deletion request
          </Typography.Title>
          <Typography.Paragraph className={styles.formLead}>
            Please provide the exact registered details so we can verify your
            account and process the request without delays.
          </Typography.Paragraph>

          {feedback ? (
            <Alert
              message={feedback.type === "success" ? "Request submitted" : "Submission failed"}
              description={
                <span>
                  {feedback.message}
                  {feedback.requestId ? (
                    <>
                      <br />
                      Request ID: {feedback.requestId}
                    </>
                  ) : null}
                </span>
              }
              showIcon
              style={{ marginBottom: 20 }}
              type={feedback.type}
            />
          ) : null}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
            scrollToFirstError
          >
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Full name is required" }]}
            >
              <Input placeholder="Enter your full name" size="large" />
            </Form.Item>

            <Form.Item
              label="Registered Phone Number"
              name="registeredPhoneNumber"
              rules={[{ required: true, message: "Phone number is required" }]}
            >
              <Input inputMode="numeric" placeholder="+91XXXXXXXXXX" size="large" />
            </Form.Item>

            <Form.Item
              label="School Name"
              name="schoolName"
              rules={[{ required: true, message: "School name is required" }]}
            >
              <Input placeholder="Enter your school name" size="large" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Role is required" }]}
            >
              <Select
                options={roles.map((role) => ({ label: role, value: role }))}
                placeholder="Select your role"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Reason"
              name="reason"
              rules={[{ required: true, message: "Please add a reason" }]}
            >
              <Input.TextArea
                autoSize={{ minRows: 4, maxRows: 7 }}
                placeholder="Tell us why you want to delete your account"
              />
            </Form.Item>

            <Button
              block
              className={styles.submitBtn}
              htmlType="submit"
              loading={loading}
              size="large"
              type="primary"
            >
              Submit request
            </Button>
          </Form>
        </div>
      </section>

      <aside className={styles.aside}>
        <Card className={styles.asideCard} variant="borderless">
          <Typography.Title className={styles.asideTitle} level={3}>
            What happens next
          </Typography.Title>
          <ul className={styles.bulletList}>
            <li>We review the deletion request manually.</li>
            <li>Associated account data is processed according to policy.</li>
            <li>You may be contacted for verification if needed.</li>
          </ul>
        </Card>

        <Card className={styles.asideCard} variant="borderless">
          <Typography.Title className={styles.asideTitle} level={3}>
            Need help?
          </Typography.Title>
          <p className={styles.support}>
            Email{" "}
            <a href="mailto:miraaqib514@gmail.com">
              <MailOutlined /> miraaqib514@gmail.com
            </a>{" "}
            for deletion support or compliance questions.
          </p>
        </Card>
      </aside>
    </div>
  );
}
