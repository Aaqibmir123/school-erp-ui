"use client";

import { Row, Col, Select, Input } from "antd";

export default function StudentFilters() {
  return (
    <Row gutter={16} style={{ marginBottom: 20 }}>
      <Col span={6}>
        <Select placeholder="Select Class" style={{ width: "100%" }} />
      </Col>

      <Col span={6}>
        <Select placeholder="Select Section (Optional)" style={{ width: "100%" }} />
      </Col>

      <Col span={8}>
        <Input placeholder="Search Student Name" />
      </Col>
    </Row>
  );
}