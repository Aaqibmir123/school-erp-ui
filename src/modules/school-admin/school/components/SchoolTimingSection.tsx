"use client";

import { Card, Checkbox, Col, Form, Row, Space, Tag, TimePicker } from "antd";

import { WEEKDAY_OPTIONS } from "../schoolSettings.types";
import styles from "../SchoolPage.module.css";

const TIME_FIELDS = [
  { field: "checkInOpenTime", label: "Check-in opens" },
  { field: "schoolStartTime", label: "School starts" },
  { field: "lateMarkAfterTime", label: "Late mark after" },
  { field: "checkInCloseTime", label: "Check-in closes" },
  { field: "schoolEndTime", label: "School ends" },
  { field: "checkOutCloseTime", label: "Check-out closes" },
] as const;

export default function SchoolTimingSection() {
  return (
    <Card variant="borderless" className={styles.sectionCard} title="School Timings">
      <Space wrap size={[6, 6]} style={{ marginBottom: 14 }}>
        <Tag color="blue">1. Open</Tag>
        <Tag color="blue">2. Start</Tag>
        <Tag color="blue">3. Late</Tag>
        <Tag color="blue">4. Close In</Tag>
        <Tag color="blue">5. End</Tag>
        <Tag color="blue">6. Close Out</Tag>
      </Space>

      <Row gutter={[16, 8]}>
        {TIME_FIELDS.map((item) => (
          <Col xs={24} md={12} key={item.field}>
            <Form.Item
              name={item.field}
              label={item.label}
              rules={[{ required: true, message: `${item.label} is required` }]}
            >
              <TimePicker
                format="h:mm A"
                use12Hours
                style={{ width: "100%" }}
                size="large"
                minuteStep={1}
              />
            </Form.Item>
          </Col>
        ))}
      </Row>

      <Form.Item
        name="workingDays"
        label="Working days"
        rules={[
          { required: true, message: "Select at least one working day" },
          {
            validator: async (_, value: string[]) => {
              if (!value || value.length === 0) {
                throw new Error("Select at least one working day");
              }
            },
          },
        ]}
      >
        <Checkbox.Group options={WEEKDAY_OPTIONS} className={styles.weekdayGroup} />
      </Form.Item>
    </Card>
  );
}
