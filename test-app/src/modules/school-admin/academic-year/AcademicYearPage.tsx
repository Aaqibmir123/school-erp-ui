"use client";

import { Button, Card, Col, Input, Row, Table, Tag } from "antd";
import { useEffect, useState } from "react";

import { showToast } from "@/src/utils/toast";
import { createAcademicYear, getAcademicYears, setActiveYear } from "./academicYear.api";

type AcademicYear = {
  _id: string;
  isActive: boolean;
  name: string;
};

const AcademicYearPage = () => {
  const [year, setYear] = useState("");
  const [data, setData] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const res = await getAcademicYears();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      showToast.apiError(error, "Failed to fetch years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleAdd = async () => {
    if (!year.trim()) {
      showToast.warning("Please enter year");
      return;
    }

    try {
      await createAcademicYear({ name: year.trim() });
      showToast.success("Year added");
      setYear("");
      fetchYears();
    } catch (error) {
      showToast.apiError(error, "Error adding year");
    }
  };

  const handleSetActive = async (record: AcademicYear) => {
    try {
      await setActiveYear(record._id);
      showToast.success("Active year updated");
      fetchYears();
    } catch (error) {
      showToast.apiError(error, "Error updating");
    }
  };

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

  return (
    <Row justify="center">
      <Col xs={24} md={16}>
        <Card variant="borderless" title="Academic Year Setup">
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
