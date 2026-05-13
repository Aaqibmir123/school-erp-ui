"use client";

import { CarryOutOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useRouter } from "next/navigation";

import styles from "./AttendancePage.module.css";

const { Title, Paragraph, Text } = Typography;

export default function AttendanceLandingPage() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <Title level={2} className={styles.title}>
            Attendance
          </Title>
          <Paragraph className={styles.subtitle}>
            Open student attendance or teacher attendance in separate pages for
            a faster, cleaner workflow.
          </Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]} className={styles.landingGrid}>
        <Col xs={24} md={12}>
          <Card variant="borderless" className={styles.landingCard}>
            <div className={styles.navBadge}>
              <TeamOutlined />
            </div>
            <Title level={4} className={styles.navTitle}>
              Student attendance
            </Title>
            <Text className={styles.navSubtitle}>
              Review class attendance with filters for class, section, date, and search.
            </Text>
            <div className={styles.navActions}>
              <Space wrap>
                <Button
                  type="primary"
                  onClick={() => router.push("/school-admin/attendance/students")}
                >
                  Open student view
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card variant="borderless" className={styles.landingCard}>
            <div className={styles.navBadge}>
              <CarryOutOutlined />
            </div>
            <Title level={4} className={styles.navTitle}>
              Teacher attendance
            </Title>
            <Text className={styles.navSubtitle}>
              Review teacher check-in, check-out, leave, and late records with filters.
            </Text>
            <div className={styles.navActions}>
              <Space wrap>
                <Button
                  type="primary"
                  onClick={() => router.push("/school-admin/attendance/teachers")}
                >
                  Open teacher view
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card variant="borderless" className={styles.tableCard}>
        <div className={styles.helperRow}>
          <Text type="secondary">
            Both views use backend data and are designed for day-to-day school review.
          </Text>
        </div>
      </Card>
    </div>
  );
}
