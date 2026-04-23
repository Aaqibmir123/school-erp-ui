"use client";

import { DollarOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Row, Table, Tag, Typography } from "antd";

const { Title } = Typography;

// 🔥 Dummy Table Data
const students = [
  {
    key: "1",
    name: "Aaqib",
    class: "10th",
    phone: "9876543210",
    status: "Active",
  },
  {
    key: "2",
    name: "Rahul",
    class: "9th",
    phone: "9123456780",
    status: "Inactive",
  },
];

// 🔥 Table Columns
const columns = [
  {
    title: "Student",
    dataIndex: "name",
    render: (text: string) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar icon={<UserOutlined />} />
        {text}
      </div>
    ),
  },
  { title: "Class", dataIndex: "class" },
  { title: "Phone", dataIndex: "phone" },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: string) => (
      <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
    ),
  },
];

export default function Dashboard() {
  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>My Dashboard</Title>

      {/* 🔥 TOP CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12 }}>
            <TeamOutlined style={{ fontSize: 24, color: "#1677ff" }} />
            <h4>Students</h4>
            <h2>120</h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12 }}>
            <UserOutlined style={{ fontSize: 24, color: "#52c41a" }} />
            <h4>Teachers</h4>
            <h2>15</h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12 }}>
            <DollarOutlined style={{ fontSize: 24, color: "#faad14" }} />
            <h4>Revenue</h4>
            <h2>₹50K</h2>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12 }}>
            <UserOutlined style={{ fontSize: 24, color: "#eb2f96" }} />
            <h4>Topper</h4>
            <h2>Aaqib</h2>
          </Card>
        </Col>
      </Row>

      {/* 🔥 MAIN SECTION */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        {/* 📋 STUDENT TABLE */}
        <Col xs={24} md={16}>
          <Card variant="borderless" title="Student List" style={{ borderRadius: 12 }}>
            <Table columns={columns} dataSource={students} pagination={false} />
          </Card>
        </Col>

        {/* 📅 EVENTS / SIDE CARD */}
        <Col xs={24} md={8}>
          <Card variant="borderless" title="Events" style={{ borderRadius: 12 }}>
            <p>📌 Annual Function - 10 Oct</p>
            <p>📌 Sports Day - 15 Oct</p>
            <p>📌 Exams - 20 Oct</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
