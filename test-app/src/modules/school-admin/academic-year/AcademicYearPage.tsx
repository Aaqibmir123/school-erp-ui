"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { showToast } from "@/src/utils/toast";
import { Button, Card, Col, Input, Row, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useCallback, useMemo, useState } from "react";

import {
  type AcademicYear,
  useCreateAcademicYearMutation,
  useGetAcademicYearsQuery,
  useSetActiveYearMutation,
} from "./academicYear.api";

function AcademicYearPage() {
  const [year, setYear] = useState("");
  const { data: years = [], isLoading } = useGetAcademicYearsQuery();
  const [createYear, createState] = useCreateAcademicYearMutation();
  const [setActiveYear, activeState] = useSetActiveYearMutation();
  const loading = isLoading || createState.isLoading || activeState.isLoading;

  const handleAdd = useCallback(async () => {
    if (!year.trim()) {
      showToast.warning("Please enter year");
      return;
    }

    try {
      await createYear({ name: year.trim() }).unwrap();
      showToast.success("Year added");
      setYear("");
    } catch (error) {
      showToast.apiError(error, "Error adding year");
    }
  }, [createYear, year]);

  const handleSetActive = useCallback(
    async (record: AcademicYear) => {
      try {
        await setActiveYear(record._id).unwrap();
        showToast.success("Active year updated");
      } catch (error) {
        showToast.apiError(error, "Error updating");
      }
    },
    [setActiveYear],
  );

  const columns: ColumnsType<AcademicYear> = useMemo(
    () => [
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
    ],
    [handleSetActive],
  );

  return (
    <Row justify="center">
      <Col xs={24} md={16}>
        <Card variant="borderless" title="Academic Year Setup">
          <Row gutter={10} style={{ marginBottom: 20 }}>
            <Col xs={24} md={18}>
              <Input
                placeholder="Enter year (e.g. 2025-26)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </Col>

            <Col xs={24} md={6}>
              <Button type="primary" onClick={handleAdd} block loading={createState.isLoading}>
                Add Year
              </Button>
            </Col>
          </Row>

          <ResponsiveTable
            rowKey="_id"
            columns={columns}
            dataSource={years}
            loading={loading}
            pagination={false}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default memo(AcademicYearPage);
