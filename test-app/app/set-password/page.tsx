"use client";

import Link from "next/link";
import { Button, Card, Typography } from "antd";

const { Paragraph, Title } = Typography;

/** Legacy route: passwords are set on the apply-school form; email links are no longer used. */
export default function SetPasswordPage() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Card variant="borderless" style={{ maxWidth: 440, width: "100%" }}>
        <Title level={4} style={{ marginTop: 0 }}>
          Password setup via link is discontinued
        </Title>
        <Paragraph type="secondary">
          Choose your admin password when you submit your school application.
          After a super admin approves your school, sign in with your email and
          that password.
        </Paragraph>
        <Link href="/apply-school">
          <Button type="primary" block>
            Register school
          </Button>
        </Link>
        <Link href="/" style={{ display: "block", marginTop: 12 }}>
          <Button block type="default">
            Back to login
          </Button>
        </Link>
      </Card>
    </div>
  );
}
