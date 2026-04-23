"use client";

import { Button, Card, Col, Input, message, Row, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import {
  createAcademicYear,
  getAcademicYears,
  setActiveYear,
} from "./academicYear.api";

/* =========================
   TYPES
========================= */

type AcademicYear = {
  _id: string;
  name: string;
  isActive: boolean;
};

/* =========================
   COMPONENT
========================= */

const AcademicYearPage = () => {
  const [year, setYear] = useState<string>("");
  const [data, setData] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /* =========================
     FETCH
  ========================= */

  const fetchYears = async () => {
    try {
      setLoading(true);

      const res = (await getAcademicYears()) as AcademicYear[];

      setData(res);
    } catch (err) {
      message.error("Failed to fetch years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  /* =========================
     ADD
  ========================= */

  const handleAdd = async () => {
    if (!year) {
      message.warning("Please enter year");
      return;
    }

    try {
      await createAcademicYear({ name: year });

      message.success("Year added");
      setYear("");
      fetchYears();
    } catch {
      message.error("Error adding year");
    }
  };

  /* =========================
     SET ACTIVE
  ========================= */

  const handleSetActive = async (record: AcademicYear) => {
    try {
      await setActiveYear(record._id);

      message.success("Active year updated");
      fetchYears();
    } catch {
      message.error("Error updating");
    }
  };

  /* =========================
     TABLE
  ========================= */

  const columns = [
    {
      title: "Academic Year",
      dataIndex: "name",
    },
    {
      title: "Status",
      render: (_: unknown, record: AcademicYear) =>
        record.isActive ? <Tag color="green">Active</Tag> : <Tag>Inactive</Tag>,
    },
    {
      title: "Action",
      render: (_: unknown, record: AcademicYear) => (
        <Button onClick={() => handleSetActive(record)}>Set Active</Button>
      ),
    },
  ];

  /* =========================
     UI
  ========================= */

  return (
    <Row justify="center">
      <Col xs={24} md={16}>
        <Card title="📅 Academic Year Setup">
          {/* ADD */}

          <Row gutter={10} style={{ marginBottom: 20 }}>
            <Col flex="auto">
              <Input
                placeholder="Enter year (e.g. 2025-26)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Col>

            <Col>
              <Button type="primary" onClick={handleAdd}>
                Add Year
              </Button>
            </Col>
          </Row>

          {/* TABLE */}

          <Table
            rowKey="_id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AcademicYearPage;
