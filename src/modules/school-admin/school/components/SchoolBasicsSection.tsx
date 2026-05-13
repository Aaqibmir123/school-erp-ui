"use client";

import { Checkbox, Card, Form, Input, Typography } from "antd";

import styles from "../SchoolPage.module.css";

const { Paragraph } = Typography;

type Props = {
  autoClean: boolean;
  onAutoCleanChange: (value: boolean) => void;
};

export default function SchoolBasicsSection({
  autoClean,
  onAutoCleanChange,
}: Props) {
  return (
    <Card variant="borderless" className={styles.sectionCard} title="School Setup">
      <Paragraph className={styles.sectionDescription}>
        Keep the school profile clean and fast. The timing settings on the right
        will later drive teacher attendance windows.
      </Paragraph>

      <Form.Item
        name="name"
        label="School Name"
        rules={[{ required: true, message: "School name is required" }]}
      >
        <Input placeholder="Green Valley School" size="large" />
      </Form.Item>

      <Form.Item name="address" label="Address">
        <Input placeholder="School address" size="large" />
      </Form.Item>

      <Form.Item>
        <Checkbox
          checked={autoClean}
          onChange={(e) => onAutoCleanChange(e.target.checked)}
        >
          Auto remove background
        </Checkbox>
      </Form.Item>
    </Card>
  );
}

