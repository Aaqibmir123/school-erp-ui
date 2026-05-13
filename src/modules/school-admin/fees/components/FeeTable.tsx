"use client";

import ResponsiveTable from "@/src/components/ResponsiveTable";
import { Button, Grid, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { memo, useMemo, useState } from "react";

import { StudentDTO } from "@/shared-types/student.types";
import FeeDrawer from "./FeeDrawer";
import FeeHistoryTable from "./FeeHistoryTable";

type FeeStudent = StudentDTO & {
  className?: string;
  sectionName?: string;
  classId?: string;
  sectionId?: string;
  parentPhone?: string;
  fatherName?: string;
};

const { Text } = Typography;
const { useBreakpoint } = Grid;

function FeeTable({
  students = [],
  loading,
}: {
  students: FeeStudent[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<FeeStudent | null>(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  /* ================= COLUMNS ================= */

  const columns: ColumnsType<FeeStudent> = useMemo(
    () => [
      {
        title: "#",
        width: 60,
        render: (_, __, index) => <Text strong>{index + 1}</Text>,
      },

      {
        title: "Name",
        dataIndex: "name",
        render: (text) => <Text strong>{text}</Text>,
      },

      {
        title: "Father Name",
        dataIndex: "fatherName",
        width: 170,
        render: (text) => <Text>{text || "-"}</Text>,
      },

      {
        title: "Class",
        width: 140,
        render: (_, row: FeeStudent) => (
          <Tag color="blue" style={{ borderRadius: 999, paddingInline: 10 }}>
            {row.className} - {row.sectionName}
          </Tag>
        ),
      },

      {
        title: "Phone",
        dataIndex: "parentPhone",
        width: 150,
        render: (text) => <Text type="secondary">{text || "-"}</Text>,
      },

      {
        title: "Action",
        align: "right",
        width: 150,
        render: (_, row) => (
          <Button
            type="primary"
            size={isMobile ? "middle" : "large"}
            block={isMobile}
            style={{
              borderRadius: 12,
              boxShadow: "0 8px 18px rgba(37, 99, 235, 0.2)",
              paddingInline: isMobile ? 12 : 18,
            }}
            onClick={() => {
              setSelectedStudent(row);
              setOpen(true);
            }}
          >
            Add Fee
          </Button>
        ),
      },
    ],
    [isMobile],
  );

  /* ================= UI ================= */

  return (
    <>
      <div style={{ marginTop: 6, marginBottom: 12 }}>
        <Text type="secondary">
          Tap a student row to open fee history. Use the colored action button to add a new fee.
        </Text>
      </div>
      <ResponsiveTable
        rowKey="_id"
      dataSource={students}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 8 }}
      expandable={{
        expandedRowRender: (record: FeeStudent) => (
          <FeeHistoryTable student={record} />
        ),
        }}
      />

      {selectedStudent ? (
        <FeeDrawer
          open={open}
          onClose={() => setOpen(false)}
          student={selectedStudent}
        />
      ) : null}
    </>
  );
}

export default memo(FeeTable);

